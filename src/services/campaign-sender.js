const EventEmitter = require('events');
const { jidNormalizedUser } = require('@whiskeysockets/baileys');
const { normalizeJid } = require('../utils/phone');
const fs = require('fs');
const { log } = require('../utils/logger');

class CampaignSender extends EventEmitter {
    constructor(campaignManager, sessions, activityLogger) {
        super();
        this.campaignManager = campaignManager;
        this.sessions = sessions;
        this.activityLogger = activityLogger;
        this.activeQueues = new Map(); // campaignId -> queue info
        this.sendingStats = new Map(); // campaignId -> stats
    }

    // Start sending a campaign
    async startCampaign(campaignId, userEmail) {
        log(`Loading campaign ${campaignId} for ${userEmail}`, 'SYSTEM', { campaignId, userEmail });
        const campaign = this.campaignManager.loadCampaign(campaignId);
        if (!campaign) {
            log(`Failed to load campaign ${campaignId}. File may be missing or decryption failed.`, 'SYSTEM', { campaignId }, 'ERROR');
            throw new Error('Campaign not found or could not be loaded');
        }

        // Check if campaign is already running
        if (this.activeQueues.has(campaignId)) {
            throw new Error('Campaign is already running');
        }

        // Check if session exists and is connected
        const session = this.sessions.get(campaign.sessionId);
        
        if (!session || session.status !== 'CONNECTED' || !session.sock) {
            log(`Session validation failed for ${campaign.sessionId}`, campaign.sessionId, {
                event: 'campaign-start-fail',
                campaignId,
                status: session?.status
            }, 'ERROR');
            throw new Error(`WhatsApp session '${campaign.sessionId}' is not connected or not available`);
        }

        log(`Starting campaign: ${campaign.name} (${campaign.recipients.length} recipients)`, campaign.sessionId, {
            event: 'campaign-start',
            campaignId,
            campaignName: campaign.name,
            recipientsCount: campaign.recipients.length
        }, 'INFO');

        // Initialize queue
        const queue = {
            campaignId,
            status: 'running',
            currentIndex: 0,
            interval: null,
            startTime: Date.now(),
            processedCount: 0
        };

        this.activeQueues.set(campaignId, queue);
        this.sendingStats.set(campaignId, {
            startTime: new Date().toISOString(),
            messagesPerMinute: 0,
            lastMessageTime: null
        });

        // Update campaign status
        this.campaignManager.updateCampaignStatus(campaignId, 'sending');

        // Log activity
        await this.activityLogger.logCampaignStart(userEmail, campaignId, campaign.name, campaign.recipients.length);

        // Start processing
        this.processQueue(campaignId);

        return {
            campaignId,
            status: 'started',
            recipientCount: campaign.recipients.length
        };
    }

    // Process campaign queue
    async processQueue(campaignId) {
        const queue = this.activeQueues.get(campaignId);
        if (!queue || queue.status !== 'running') return;

        const campaign = this.campaignManager.loadCampaign(campaignId);
        if (!campaign) {
            this.stopCampaign(campaignId);
            return;
        }

        const session = this.sessions.get(campaign.sessionId);
        log(`Vérification de la session pour ${campaign.sessionId} dans processQueue`, campaign.sessionId, {
            sessionExists: !!session,
            sessionStatus: session?.status,
            hasSock: !!session?.sock
        }, 'DEBUG');

        if (!session || session.status !== 'CONNECTED' || !session.sock) {
            log(`Session ${campaign.sessionId} not available or not connected`, campaign.sessionId, {
                event: 'campaign-batch-fail',
                campaignId
            }, 'ERROR');
            this.pauseCampaign(campaignId, 'Session disconnected or not available');
            return;
        }

        // Get next batch of recipients
        const pendingRecipients = this.campaignManager.getPendingRecipients(campaignId, 1);

        if (pendingRecipients.length === 0) {
            log(`Campaign ${campaign.name} completed`, campaign.sessionId, {
                event: 'campaign-complete',
                campaignId
            }, 'INFO');
            // Campaign completed
            this.completeCampaign(campaignId);
            return;
        }

        const recipient = pendingRecipients[0];

        try {
            // Process template
            let messageContent = this.campaignManager.processTemplate(campaign.message.content, recipient);

            // Remove HTML tags for WhatsApp (keep line breaks)
            messageContent = messageContent
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<p>/gi, '')
                .replace(/<\/p>/gi, '\n\n')
                .replace(/<[^>]*>/g, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            // Prepare message based on type
            let messageData;
            const jid = normalizeJid(recipient.number);

            // Function to get media payload (buffer for local files, url object for remote)
            const getMediaPayload = (mediaUrl) => {
                if (!mediaUrl) return null;
                
                // Check if it's a local file path
                if (mediaUrl.startsWith('/') || mediaUrl.includes(':\\') || mediaUrl.includes(':/')) {
                    try {
                        if (fs.existsSync(mediaUrl)) {
                            return fs.readFileSync(mediaUrl);
                        }
                    } catch (e) {
                        log(`Échec de la lecture du fichier média local: ${mediaUrl}`, campaign.sessionId, { error: e.message }, 'WARN');
                    }
                }
                
                // Default to URL object
                return { url: mediaUrl };
            };

            switch (campaign.message.type) {
                case 'text':
                    messageData = {
                        text: messageContent
                    };
                    break;

                case 'image':
                    messageData = {
                        image: getMediaPayload(campaign.message.mediaUrl),
                        caption: campaign.message.mediaCaption ?
                            this.campaignManager.processTemplate(campaign.message.mediaCaption, recipient) :
                            messageContent
                    };
                    break;

                case 'document':
                    messageData = {
                        document: getMediaPayload(campaign.message.mediaUrl),
                        fileName: campaign.message.fileName || 'document.pdf',
                        caption: campaign.message.mediaCaption ?
                            this.campaignManager.processTemplate(campaign.message.mediaCaption, recipient) :
                            messageContent
                    };
                    break;

                case 'audio':
                    messageData = {
                        audio: getMediaPayload(campaign.message.mediaUrl),
                        mimetype: campaign.message.mimetype || 'audio/mp4',
                        ptt: campaign.message.ptt || false
                    };
                    break;

                case 'video':
                    messageData = {
                        video: getMediaPayload(campaign.message.mediaUrl),
                        caption: campaign.message.mediaCaption ?
                            this.campaignManager.processTemplate(campaign.message.mediaCaption, recipient) :
                            messageContent,
                        mimetype: campaign.message.mimetype || 'video/mp4'
                    };
                    break;

                default:
                    throw new Error(`Unsupported message type: ${campaign.message.type}`);
            }

            // Send message using the correct property name (sock instead of socket)
            log(`Sending message to ${recipient.number} (${recipient.name || 'Unknown'})`, campaign.sessionId, {
                event: 'campaign-message-sending',
                campaignId,
                recipient: recipient.number,
                messageType: campaign.message.type
            }, 'INFO');

            await session.sock.sendMessage(jid, messageData);

            // Update recipient status
            this.campaignManager.updateRecipientStatus(campaignId, recipient.number, 'sent');

            // Update stats
            queue.processedCount++;
            const stats = this.sendingStats.get(campaignId);
            if (stats) {
                stats.lastMessageTime = new Date().toISOString();
                const elapsedMinutes = (Date.now() - Date.parse(stats.startTime)) / 60000;
                stats.messagesPerMinute = elapsedMinutes > 0 ? queue.processedCount / elapsedMinutes : 0;
            }

            // Emit progress event
            this.emit('progress', {
                campaignId,
                processed: queue.processedCount,
                total: campaign.statistics.total,
                recipient: {
                    number: recipient.number,
                    name: recipient.name,
                    status: 'sent'
                }
            });

            // Log activity
            await this.activityLogger.logCampaignMessage(
                campaign.createdBy,
                campaignId,
                recipient.number,
                'sent'
            );

            log(`Message sent successfully to ${recipient.number}`, campaign.sessionId, {
                event: 'campaign-message-sent',
                campaignId,
                recipient: recipient.number
            }, 'INFO');

        } catch (error) {
            log(`Error sending to ${recipient.number}: ${error.message}`, campaign.sessionId, {
                event: 'campaign-message-fail',
                campaignId,
                recipient: recipient.number,
                error: error.message
            }, 'ERROR');

            // Update recipient status with error
            this.campaignManager.updateRecipientStatus(
                campaignId,
                recipient.number,
                'failed',
                error.message
            );

            // Emit progress event
            this.emit('progress', {
                campaignId,
                processed: queue.processedCount,
                total: campaign.statistics.total,
                recipient: {
                    number: recipient.number,
                    name: recipient.name,
                    status: 'failed',
                    error: error.message
                }
            });

            // Log activity
            await this.activityLogger.logCampaignMessage(
                campaign.createdBy,
                campaignId,
                recipient.number,
                'failed',
                error.message
            );
        }

        // Schedule next message
        if (queue.status === 'running') {
            const delay = campaign.settings.delayBetweenMessages || 3000;
            setTimeout(() => {
                this.processQueue(campaignId);
            }, delay);
        }
    }

    // Pause campaign
    pauseCampaign(campaignId, reason = null) {
        const queue = this.activeQueues.get(campaignId);
        if (!queue) return;

        queue.status = 'paused';
        if (queue.interval) {
            clearInterval(queue.interval);
            queue.interval = null;
        }

        this.campaignManager.updateCampaignStatus(campaignId, 'paused');

        this.emit('status', {
            campaignId,
            status: 'paused',
            reason
        });

        return true;
    }

    // Resume campaign
    async resumeCampaign(campaignId, userEmail) {
        const queue = this.activeQueues.get(campaignId);
        const campaign = this.campaignManager.loadCampaign(campaignId);

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        // Check if session exists and is connected
        const session = this.sessions.get(campaign.sessionId);
        if (!session || session.status !== 'CONNECTED' || !session.sock) {
            log(`Échec de la validation de la session pour la reprise de ${campaign.sessionId}`, campaign.sessionId, {
                campaignId,
                status: session?.status
            }, 'ERROR');
            throw new Error(`WhatsApp session '${campaign.sessionId}' is not connected`);
        }

        log(`Reprise de la campagne: ${campaign.name}`, campaign.sessionId, { campaignId, campaignName: campaign.name }, 'INFO');

        if (!queue) {
            // Re-create queue if it doesn't exist
            const newQueue = {
                campaignId,
                status: 'running',
                currentIndex: 0,
                interval: null,
                startTime: Date.now(),
                processedCount: campaign.statistics.sent
            };
            this.activeQueues.set(campaignId, newQueue);
        } else {
            queue.status = 'running';
        }

        this.campaignManager.updateCampaignStatus(campaignId, 'sending');

        // Log activity
        await this.activityLogger.logCampaignResume(userEmail, campaignId, campaign.name);

        // Start processing
        this.processQueue(campaignId);

        this.emit('status', {
            campaignId,
            status: 'resumed'
        });

        return true;
    }

    // Stop campaign
    stopCampaign(campaignId) {
        const queue = this.activeQueues.get(campaignId);
        if (!queue) return;

        if (queue.interval) {
            clearInterval(queue.interval);
        }

        this.activeQueues.delete(campaignId);
        this.sendingStats.delete(campaignId);

        this.emit('status', {
            campaignId,
            status: 'stopped'
        });
    }

    // Complete campaign
    async completeCampaign(campaignId) {
        const queue = this.activeQueues.get(campaignId);
        const campaign = this.campaignManager.loadCampaign(campaignId);

        if (queue) {
            this.stopCampaign(campaignId);
        }

        if (campaign) {
            this.campaignManager.updateCampaignStatus(campaignId, 'completed');

            // Log activity
            await this.activityLogger.logCampaignComplete(
                campaign.createdBy,
                campaignId,
                campaign.name,
                campaign.statistics
            );
        }

        this.emit('status', {
            campaignId,
            status: 'completed'
        });
    }

    // Retry failed messages
    async retryFailed(campaignId, userEmail) {
        const campaign = this.campaignManager.loadCampaign(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        // Mark all failed recipients for retry
        let retryCount = 0;
        campaign.recipients.forEach(recipient => {
            if (recipient.status === 'failed') {
                this.campaignManager.markForRetry(campaignId, recipient.number);
                retryCount++;
            }
        });

        if (retryCount > 0) {
            // Log activity
            await this.activityLogger.logCampaignRetry(userEmail, campaignId, campaign.name, retryCount);

            // Start sending if not already running
            if (!this.activeQueues.has(campaignId)) {
                return this.startCampaign(campaignId, userEmail);
            }
        }

        return {
            campaignId,
            retryCount,
            status: retryCount > 0 ? 'retrying' : 'no_failed_messages'
        };
    }

    // Get campaign status
    getCampaignStatus(campaignId) {
        const queue = this.activeQueues.get(campaignId);
        const stats = this.sendingStats.get(campaignId);
        const campaign = this.campaignManager.loadCampaign(campaignId);

        if (!campaign) {
            return null;
        }

        return {
            campaignId,
            name: campaign.name,
            status: campaign.status,
            isActive: !!queue,
            queueStatus: queue ? queue.status : 'inactive',
            statistics: campaign.statistics,
            sendingStats: stats || null,
            progress: campaign.statistics.total > 0 ?
                ((campaign.statistics.sent + campaign.statistics.failed) / campaign.statistics.total) * 100 : 0
        };
    }

    // Get all active campaigns
    getActiveCampaigns() {
        const active = [];
        this.activeQueues.forEach((queue, campaignId) => {
            const status = this.getCampaignStatus(campaignId);
            if (status) {
                active.push(status);
            }
        });
        return active;
    }
}

module.exports = CampaignSender; 