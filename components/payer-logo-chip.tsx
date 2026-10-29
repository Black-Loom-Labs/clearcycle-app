"use client"

import { useState } from "react"

export function PayerLogoChip({ name, domain }: { name: string; domain: string }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-[#E8E4D8] bg-white px-4 py-2 shadow-sm">
      {!imgFailed && (
        <img
          src={`https://logo.clearbit.com/${domain}`}
          alt={name}
          width={20}
          height={20}
          className="size-5 rounded-sm object-contain"
          onError={() => setImgFailed(true)}
        />
      )}
      <span className="text-xs font-medium text-[#5C5C6B]">{name}</span>
    </div>
  )
}
