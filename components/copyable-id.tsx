"use client"

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CopyableId({
  value,
  displayValue,
  className,
}: {
  value: string
  displayValue?: React.ReactNode
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  function copy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-1.5 font-mono text-[#0A0A0F] hover:text-[#1E6BFF]',
        className
      )}
      onClick={copy}
      title="Copy claim ID"
    >
      {copied ? (
        <span className="text-[#16A34A]">Copied</span>
      ) : (
        displayValue ?? value
      )}
      {copied ? (
        <Check className="size-3 text-[#16A34A]" />
      ) : (
        <Copy className="size-3 text-[#5C5C6B]" />
      )}
    </button>
  )
}
