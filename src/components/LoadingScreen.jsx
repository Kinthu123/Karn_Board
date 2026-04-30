import { useState, useEffect } from 'react'

const BOOT_LINES = [
  'KARNBOARD OS v1.0',
  'Loading modules...',
  'Connecting to server...',
  'Mounting task engine...',
  'System ready.',
]

const BAR_SEGMENTS = 20

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress]   = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [done, setDone]           = useState(false)

  useEffect(() => {
    const total = 900
    const tick  = total / BAR_SEGMENTS
    const timers = []

    for (let i = 1; i <= BAR_SEGMENTS; i++) {
      timers.push(
        setTimeout(() => {
          setProgress(i)
          const li = Math.floor((i / BAR_SEGMENTS) * BOOT_LINES.length)
          setLineIndex(Math.min(li, BOOT_LINES.length - 1))
        }, tick * i)
      )
    }

    timers.push(
      setTimeout(() => {
        setDone(true)
        setTimeout(onComplete, 300)
      }, total + 150)
    )

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const filled  = Math.round((progress / BAR_SEGMENTS) * BAR_SEGMENTS)
  const percent = Math.round((progress / BAR_SEGMENTS) * 100)

  return (
    <div className={`
      scanline dot-grid fixed inset-0 bg-base
      flex flex-col items-center justify-center gap-7
      transition-opacity duration-300 ${done ? 'opacity-0' : 'opacity-100'}
    `}>

      {/* Logo */}
      <PixelLogo />

      {/* Terminal console */}
      <div className="w-80 border-2 border-border bg-surface shadow-pixel overflow-hidden">
        {/* macOS-style header bar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-card border-b border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-red/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green/60" />
          <span className="font-pixel text-[6px] text-border ml-auto tracking-widest">BOOT SEQUENCE</span>
        </div>

        {/* Boot lines */}
        <div className="p-4 space-y-2 min-h-[116px]">
          {BOOT_LINES.slice(0, lineIndex + 1).map((line, i) => (
            <p key={i} className="font-pixel text-[7px] text-green-light leading-relaxed flex items-start gap-2">
              <span className="text-yellow/50 shrink-0">{'>'}</span>
              <span>
                {i < lineIndex ? line : <TypingLine text={line} />}
              </span>
            </p>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col items-center gap-2.5">
        <div className="flex gap-[3px]">
          {Array.from({ length: BAR_SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3.5 transition-colors duration-75 ${
                i < filled ? 'bg-yellow' : 'bg-card border border-border'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-px bg-border" />
          <p className="font-pixel text-[7px] text-muted w-20 text-center">
            {progress === BAR_SEGMENTS ? '✓ COMPLETE' : `${percent}%`}
          </p>
          <div className="w-10 h-px bg-border" />
        </div>
      </div>

    </div>
  )
}

function TypingLine({ text }) {
  const [chars, setChars] = useState('')

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i++
      setChars(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [text])

  return (
    <span>
      {chars}
      <span className="animate-blink text-yellow">_</span>
    </span>
  )
}

function PixelLogo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-5 gap-[3px]">
        {PIXEL_K.map((row, ri) =>
          row.map((on, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={`w-5 h-5 ${on ? 'bg-yellow' : 'bg-transparent'}`}
            />
          ))
        )}
      </div>
      <p className="font-pixel text-[11px] text-yellow tracking-widest glow-yellow">KARNBOARD</p>
    </div>
  )
}

const PIXEL_K = [
  [1, 0, 0, 1, 0],
  [1, 0, 1, 0, 0],
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [1, 0, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 0, 1],
]
