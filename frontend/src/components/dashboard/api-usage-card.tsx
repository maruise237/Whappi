"use client"

import * as React from "react"
import { Terminal, Copy, Check } from "lucide-react"
import Prism from "prismjs"
import "prismjs/components/prism-bash"
import "prismjs/themes/prism-tomorrow.css"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn, copyToClipboard as copyUtil } from "@/lib/utils"
import { toast } from "sonner"

interface ApiUsageCardProps {
  activeTab: string;
  sessionId?: string;
  token?: string;
}

export function ApiUsageCard({ activeTab, sessionId, token }: ApiUsageCardProps) {
  const [copied, setCopied] = React.useState(false)

  const getCurlExample = (tab: string) => {
    const sId = sessionId || "ID_SESSION";
    const tkn = token || "VOTRE_TOKEN";
    const base = `curl -X POST "http://localhost:3000/api/v1/messages?sessionId=${sId}" \\
  -H "Authorization: Bearer ${tkn}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "2250102030405",`

    switch (tab) {
      case "image":
        return `${base}
    "type": "image",
    "image": {
      "link": "https://example.com/image.jpg",
      "caption": "Regardez ça !"
    }
  }'`
      case "video":
        return `${base}
    "type": "video",
    "video": {
      "link": "https://example.com/video.mp4",
      "caption": "Visionnez ceci !"
    }
  }'`
      case "audio":
        return `${base}
    "type": "audio",
    "audio": {
      "link": "https://example.com/audio.mp3"
    }
  }'`
      case "document":
        return `${base}
    "type": "document",
    "document": {
      "link": "https://example.com/file.pdf",
      "filename": "document.pdf"
    }
  }'`
      default:
        return `${base}
    "type": "text",
    "text": "Bonjour depuis l'API Whappi !"
  }'`
    }
  }

  const curlExample = getCurlExample(activeTab)

  const copyToClipboard = async () => {
    const success = await copyUtil(curlExample)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Copié dans le presse-papier")
    } else {
      toast.error("Échec de la copie")
    }
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-card border border-slate-200 dark:border-primary/10 rounded-lg shadow-lg group relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors duration-200" />
      
      <CardHeader className="bg-primary/5 p-6 sm:p-8 border-b border-slate-100 dark:border-primary/5 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-200">
              <Terminal className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-primary uppercase">Référence API</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Exemple de requête cURL</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "gap-3 h-12 px-6 rounded-lg transition-all w-full sm:w-auto",
              copied 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm" 
                : "bg-white/50 dark:bg-background/40 backdrop-blur-sm hover:bg-primary/10 hover:text-primary border-slate-200 dark:border-primary/20"
            )}
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="text-[11px] font-bold uppercase tracking-widest">{copied ? "Copié" : "Copier"}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 sm:p-8 relative z-10">
        <div className="relative group/code">
          <div className="relative">
            <ScrollArea className="h-[300px] w-full bg-slate-950 rounded-lg border border-slate-800 p-6 shadow-xl overflow-hidden group-hover/code:border-primary/20 transition-colors duration-200">
              <pre className="font-mono text-[13px] text-slate-300 whitespace-pre-wrap leading-relaxed selection:bg-primary/30">
                <code 
                  className="language-bash"
                  dangerouslySetInnerHTML={{ 
                    __html: Prism.highlight(curlExample, Prism.languages.bash, 'bash') 
                  }}
                />
              </pre>
            </ScrollArea>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-40" />
          </div>
          <span className="flex items-center gap-2">
            Endpoint: <span className="text-primary font-bold">POST</span>
            <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary/60 border border-primary/10">/api/v1/messages</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
