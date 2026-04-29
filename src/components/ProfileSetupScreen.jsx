import { useState } from 'react'
import { AVATAR_COLORS, SKILLS, initials } from '../storage'

export default function ProfileSetupScreen({ onCreate }) {
  const [step, setStep]       = useState(1)    // 1 = name, 2 = avatar + skills
  const [name, setName]       = useState('')
  const [color, setColor]     = useState(AVATAR_COLORS[0])
  const [skills, setSkills]   = useState([])
  const [nameError, setNameError] = useState('')

  function handleNameNext(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setNameError('Tell us your name first.'); return }
    setName(trimmed)
    setStep(2)
  }

  function toggleSkill(skill) {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  function handleFinish() {
    onCreate({ name: name.trim(), color, skills })
  }

  return (
    <div className="scanline fixed inset-0 bg-base flex flex-col items-center justify-center gap-10 px-6 animate-fade-in">

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-6 h-6 flex items-center justify-center border-2 font-pixel text-[8px] transition-colors ${
              s <= step ? 'border-yellow bg-yellow text-base' : 'border-border text-muted'
            }`}>
              {s < step ? '✓' : s}
            </div>
            {s < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-yellow' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleNameNext} className="flex flex-col items-center gap-8 w-full max-w-sm animate-slide-up">
          <div className="text-center space-y-3">
            <p className="font-pixel text-[8px] text-muted">STEP 1 OF 2</p>
            <h1 className="font-pixel text-yellow text-sm leading-loose">WHO ARE YOU?</h1>
            <p className="font-sans text-muted text-sm leading-relaxed">
              This helps your teammates find and recognize you across projects.
            </p>
          </div>

          <div className="w-full space-y-2">
            <label className="font-pixel text-[8px] text-muted">YOUR NAME</label>
            <input
              autoFocus
              value={name}
              onChange={e => { setName(e.target.value); setNameError('') }}
              placeholder="e.g. Alex Kim"
              className="
                w-full bg-card border-2 border-border
                px-4 py-3 font-sans text-base text-text
                placeholder:text-border
                focus:outline-none focus:border-yellow transition-colors
              "
            />
            {nameError && <p className="font-pixel text-[7px] text-red">{nameError}</p>}
          </div>

          <button
            type="submit"
            className="
              w-full font-pixel text-[10px] text-base bg-yellow
              py-4 border-2 border-yellow-dark shadow-pixel
              hover:translate-y-[-2px] hover:shadow-pixel
              active:translate-y-0 active:shadow-none
              transition-all duration-75
            "
          >
            NEXT →
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm animate-slide-up">
          <div className="text-center space-y-3">
            <p className="font-pixel text-[8px] text-muted">STEP 2 OF 2</p>
            <h1 className="font-pixel text-yellow text-sm leading-loose">YOUR PROFILE</h1>
            <p className="font-sans text-muted text-sm leading-relaxed">
              Pick an avatar color and add skills so project owners can find you.
            </p>
          </div>

          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-20 h-20 flex items-center justify-center font-pixel text-base text-lg border-2 border-border shadow-pixel"
              style={{ backgroundColor: color }}
            >
              {initials(name)}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 border-2 transition-all ${
                    color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-pixel text-[8px] text-muted">YOUR SKILLS</label>
              <span className="font-pixel text-[7px] text-border">PICK ANY</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`
                    font-pixel text-[7px] px-3 py-2 border-2 transition-all
                    ${skills.includes(skill)
                      ? 'border-yellow text-yellow bg-yellow/10'
                      : 'border-border text-muted hover:border-muted'
                    }
                  `}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="
              w-full font-pixel text-[10px] text-base bg-yellow
              py-4 border-2 border-yellow-dark shadow-pixel
              hover:translate-y-[-2px] hover:shadow-pixel
              active:translate-y-0 active:shadow-none
              transition-all duration-75
            "
          >
            LET'S BUILD →
          </button>

          <button
            onClick={() => setStep(1)}
            className="font-pixel text-[8px] text-muted hover:text-text transition-colors"
          >
            ← BACK
          </button>
        </div>
      )}
    </div>
  )
}
