"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"

export function VslPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const manuallyPaused = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !manuallyPaused.current) {
          video.muted = false
          setMuted(false)
          video.play().catch(() => {
            // browser blocked unmuted autoplay — fall back to muted
            video.muted = true
            setMuted(true)
            video.play().catch(() => {})
          })
        } else if (!entry.isIntersecting) {
          video.pause()
          video.muted = true
          setMuted(true)
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(video)

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)

    return () => {
      observer.disconnect()
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
    }
  }, [])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      manuallyPaused.current = false
      video.play().catch(() => {})
    } else {
      manuallyPaused.current = true
      video.pause()
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#EAE6DE] bg-black shadow-sm"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src="/vsl.mp4"
        muted
        playsInline
        preload="metadata"
        className="block w-full"
      />

      {/* Play/pause overlay — only shows on hover or when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="size-7 translate-x-0.5 text-[#0F1F3D]" fill="#0F1F3D" />
          </div>
        </div>
      )}
      {playing && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/80 shadow-lg">
            <Pause className="size-6 text-[#0F1F3D]" fill="#0F1F3D" />
          </div>
        </div>
      )}

      {/* Mute toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleMute() }}
        className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
      >
        {muted
          ? <><VolumeX className="size-3.5" /> Unmute</>
          : <><Volume2 className="size-3.5" /> Mute</>
        }
      </button>
    </div>
  )
}
