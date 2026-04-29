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
  const [progress, setProgress] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const total = 900
    const tick = total / BAR_SEGMENTS
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

  const filled = Math.round((progress / BAR_SEGMENTS) * BAR_SEGMENTS)

  return (
    <div className={`scanline fixed inset-0 bg-base flex flex-col items-center justify-center gap-10 transition-opacity duration-300 ${done ? 'opacity-0' : 'opacity-100'}`}>
      {/* Pixel logo */}
      <PixelLogo />

      {/* Boot lines */}
      <div className="w-72 space-y-1">
        {BOOT_LINES.slice(0, lineIndex + 1).map((line, i) => (
          <p
            key={i}
            className="font-pixel text-[8px] text-green-light leading-relaxed"
          >
            {i < lineIndex ? line : <TypingLine text={line} />}
          </p>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-[3px]">
          {Array.from({ length: BAR_SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-4 transition-colors duration-75 ${
                i < filled ? 'bg-yellow' : 'bg-surface'
              }`}
            />
          ))}
        </div>
        <p className="font-pixel text-[7px] text-muted animate-blink">
          {progress === BAR_SEGMENTS ? 'COMPLETE' : 'INITIALIZING...'}
        </p>
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
    <div className="flex flex-col items-center gap-3">
      {/* Pixel "K" made of divs */}
      <div className="grid grid-cols-5 gap-[3px]">
        {PIXEL_K.map((row, ri) =>
          row.map((on, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={`w-4 h-4 ${on ? 'bg-yellow' : 'bg-transparent'}`}
            />
          ))
        )}
      </div>
      <p className="font-pixel text-[9px] text-yellow tracking-widest">KARNBOARD</p>
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
