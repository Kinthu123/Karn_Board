import { useState } from 'react'

export default function CreateBoardScreen({ onCreate }) {
  const [clicking, setClicking] = useState(false)

  function handleCreate() {
    setClicking(true)
    setTimeout(onCreate, 400)
  }

  return (
    <div className="scanline fixed inset-0 bg-base flex flex-col items-center justify-center gap-12 px-6 animate-fade-in">
      {/* Pixel illustration — empty grid */}
      <EmptyGridIllustration />

      {/* Copy */}
      <div className="text-center space-y-5">
        <h1 className="font-pixel text-yellow text-base leading-loose tracking-wider">
          NO ACTIVE<br />BOARD
        </h1>
        <p className="font-sans text-muted text-sm leading-relaxed max-w-xs mx-auto">
          Create your first productivity board to start tracking tasks and earning XP.
        </p>
      </div>

      {/* CTA button */}
      <button
        onClick={handleCreate}
        disabled={clicking}
        className={`
          font-pixel text-[10px] text-base bg-yellow
          px-8 py-4 leading-none
          border-2 border-yellow-dark
          shadow-pixel
          transition-all duration-75
          ${clicking
            ? 'translate-y-1 shadow-none opacity-80'
            : 'hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-y-1 active:shadow-none'
          }
        `}
      >
        {clicking ? 'CREATING...' : '+ CREATE BOARD'}
      </button>

      {/* Footer hint */}
      <p className="font-pixel text-[7px] text-border absolute bottom-6">
        YOUR DATA STAYS LOCAL — NO ACCOUNT NEEDED
      </p>
    </div>
  )
}

function EmptyGridIllustration() {
  return (
    <div className="flex gap-3">
      {[...Array(3)].map((_, ci) => (
        <div
          key={ci}
          className="w-20 border-2 border-dashed border-border rounded-none flex flex-col gap-2 p-2"
        >
          <div className="h-2 bg-border w-3/4" />
          {[...Array(3)].map((_, ri) => (
            <div key={ri} className="h-8 bg-surface border border-border" />
          ))}
        </div>
      ))}
    </div>
  )
}
