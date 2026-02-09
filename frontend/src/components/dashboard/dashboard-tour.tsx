"use client"

import * as React from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

interface DashboardTourProps {
  enabled: boolean
  onExit: () => void
}

export function DashboardTour({ enabled, onExit }: DashboardTourProps) {
  React.useEffect(() => {
    if (enabled) {
      const driverObj = driver({
        popoverClass: 'driverjs-theme',
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.75)',
        nextBtnText: 'Suivant',
        prevBtnText: 'Précédent',
        doneBtnText: 'Terminé',
        steps: [
          {
            element: '.whappi-logo',
            popover: {
              title: 'Bienvenue sur Whappi',
              description: 'Votre passerelle WhatsApp ultra-légère et performante. Commençons par un petit tour guidé.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '.qr-scan-button',
            popover: {
              title: 'Scanner le QR Code',
              description: 'C\'est ici que tout commence. Cliquez sur ce bouton pour générer un QR code et scannez-le avec votre téléphone pour connecter votre compte WhatsApp.',
              side: "bottom",
              align: 'center'
            }
          },
          {
            element: '.messaging-tabs',
            popover: {
              title: 'Envoi de Messages',
              description: 'Une fois connecté, utilisez ces onglets pour envoyer des messages texte, des images ou des documents instantanément.',
              side: "top",
              align: 'center'
            }
          },
          {
            element: '.log-viewer',
            popover: {
              title: 'Zone des Logs',
              description: 'Suivez en temps réel tout ce qui se passe sur votre serveur. Idéal pour le débogage et le suivi des envois.',
              side: "top",
              align: 'center'
            }
          },
          {
            element: '.api-usage-card',
            popover: {
              title: 'Intégration API',
              description: 'Besoin d\'automatiser ? Copiez ces exemples de code pour intégrer Whappi dans vos propres applications.',
              side: "top",
              align: 'center'
            }
          },
          {
            element: '.help-button',
            popover: {
              title: 'Besoin d\'aide ?',
              description: 'Vous pouvez relancer ce tour guidé à tout moment en cliquant ici. Bonne découverte !',
              side: "left",
              align: 'center'
            }
          }
        ],
        onDestroyStarted: () => {
          onExit()
        }
      })

      // Un petit délai pour s'assurer que le DOM est prêt
      const timer = setTimeout(() => {
        driverObj.drive()
      }, 500)

      return () => {
        clearTimeout(timer)
        driverObj.destroy()
      }
    }
  }, [enabled, onExit])

  return (
    <style jsx global>{`
      .driver-popover.driverjs-theme {
        background-color: var(--card);
        color: var(--card-foreground);
        border: 2px solid var(--primary);
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
        max-width: 350px;
        font-family: var(--font-sans), system-ui, sans-serif;
      }

      .driver-popover.driverjs-theme .driver-popover-title {
        color: var(--primary);
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.025em;
        margin-bottom: 0.5rem;
      }

      .driver-popover.driverjs-theme .driver-popover-description {
        color: var(--muted-foreground);
        font-size: 0.95rem;
        line-height: 1.6;
      }

      .driver-popover.driverjs-theme .driver-popover-footer {
        margin-top: 1.5rem;
        gap: 0.75rem;
      }

      .driver-popover.driverjs-theme .driver-popover-btn {
        background-color: var(--secondary);
        color: var(--secondary-foreground);
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        text-shadow: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .driver-popover.driverjs-theme .driver-popover-btn:hover {
        background-color: var(--accent);
        color: var(--accent-foreground);
      }

      .driver-popover.driverjs-theme .driver-popover-next-btn {
        background-color: var(--primary);
        color: var(--primary-foreground);
        border-color: var(--primary);
      }

      .driver-popover.driverjs-theme .driver-popover-next-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .driver-popover.driverjs-theme .driver-popover-close-btn {
        color: var(--muted-foreground);
      }

      .driver-popover.driverjs-theme .driver-popover-arrow {
        border-color: var(--primary);
      }

      .driver-popover.driverjs-theme .driver-popover-progress-text {
        color: var(--muted-foreground);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .driverjs-overlay {
        backdrop-filter: blur(4px);
        background-color: rgba(0, 0, 0, 0.4) !important;
        pointer-events: none !important;
      }

      .driverjs-active-element {
        border: 2px solid var(--primary) !important;
        box-shadow: 0 0 0 4px var(--primary-foreground), 0 0 20px var(--primary) !important;
      }
    `}</style>
  )
}
