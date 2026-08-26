import * as React from 'react'

/**
 * Renders plain-text letter content that contains light markdown
 * (**bold** and --- horizontal rules) without pulling in a full
 * markdown parser. Everything else is preserved as literal text.
 */
export function LetterText({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n')

  return (
    <div className={className}>
      {lines.map((line, i) => {
        if (/^-{3,}$/.test(line.trim())) {
          return <hr key={i} className="my-3 border-[#E4E4EF]" />
        }
        return (
          <React.Fragment key={i}>
            {renderInline(line)}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function renderInline(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== '')
  return parts.map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/)
    if (match) {
      return <strong key={i}>{match[1]}</strong>
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}
