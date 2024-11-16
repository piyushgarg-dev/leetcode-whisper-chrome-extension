

import React, { useState } from 'react'
import Markdown, { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MarkdownWithCodeProps {
  children: string
}

const MarkdownWithCode: React.FC<MarkdownWithCodeProps> = ({ children }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  const components: Components = {
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const code = String(children).replace(/\n$/, '')

      if (match) {
        return (
          <div className="relative">
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
              className="rounded-md my-2"
              {...props}
            >
              {code}
            </SyntaxHighlighter>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(code)}
            >
              {copiedCode === code ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
  }

  return <Markdown components={components}>{children}</Markdown>
}

export default MarkdownWithCode
