import { useState } from 'react'
import { AVATAR_COLORS, SKILLS, initials } from '../storage'

export default function ProfileSetupScreen({ onCreate }) {
  const [step, setStep]           = useState(1)
  const [name, setName]           = useState('')
  const [color, setColor]         = useState(AVATAR_COLORS[0])
  const [skills, setSkills]       = useState([])
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
    <div className="scanline dot-grid fixed inset-0 bg-base flex flex-col items-center justify-center gap-8 px-6 animate-fade-in">

      {/* Step indicator */}
      <div className="flex items-center">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-9 h-9 flex items-center justify-center border-2 font-pixel text-[8px] transition-all duration-200
                ${s < step  ? 'border-yellow bg-yellow text-base shadow-pixel-sm' :
                  s === step ? 'border-yellow text-yellow shadow-pixel-sm' :
                               'border-border text-border'}
              `}>
                {s < step ? '✓' : s}
              </div>
              <span className={`font-pixel text-[6px] ${s <= step ? 'text-yellow/70' : 'text-border'}`}>
                {s === 1 ? 'NAME' : 'PROFILE'}
              </span>
            </div>
            {s < 2 && (
              <div className={`w-16 h-px mx-2 mb-5 transition-colors ${step > s ? 'bg-yellow/60' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form
          key="step1"
          onSubmit={handleNameNext}
          className="flex flex-col items-center gap-7 w-full max-w-sm animate-slide-up"
        >
          <div className="text-center space-y-3">
            <p className="font-pixel text-[7px] text-muted">STEP 1 OF 2</p>
            <h1 className="font-pixel text-yellow text-sm leading-loose glow-yellow">WHO ARE YOU?</h1>
            <p className="font-sans text-muted text-sm leading-relaxed">
              This helps your teammates recognize you across projects.
            </p>
          </div>

          <div className="relative w-full bg-card border-2 border-border p-6 shadow-pixel">
            <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-yellow/50" />
            <div className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-yellow/50" />
            <div className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-yellow/50" />
            <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-yellow/50" />

            <div className="space-y-2">
              <label className="font-pixel text-[7px] text-yellow/70 flex items-center gap-1.5">
                <span>▸</span> YOUR NAME
              </label>
              <input
                autoFocus
                value={name}
                onChange={e => { setName(e.target.value); setNameError('') }}
                placeholder="e.g. Alex Kim"
                className="w-full bg-base border-2 border-border px-4 py-3 font-sans text-base text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
              />
              {nameError && (
                <p className="font-pixel text-[7px] text-red flex items-center gap-1.5">
                  <span>⚠</span>{nameError}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full font-pixel text-[10px] text-base bg-yellow py-4 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-0.5 hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all duration-75"
          >
            NEXT →
          </button>
        </form>
      )}

      {step === 2 && (
        <div
          key="step2"
          className="flex flex-col items-center gap-6 w-full max-w-sm animate-slide-up"
        >
          <div className="text-center space-y-3">
            <p className="font-pixel text-[7px] text-muted">STEP 2 OF 2</p>
            <h1 className="font-pixel text-yellow text-sm leading-loose glow-yellow">YOUR PROFILE</h1>
            <p className="font-sans text-muted text-sm leading-relaxed">
              Pick a color and add skills so project owners can find you.
            </p>
          </div>

          {/* Avatar + color picker */}
          <div className="relative w-full bg-card border-2 border-border p-6 shadow-pixel">
            <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-yellow/50" />
            <div className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-yellow/50" />
            <div className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-yellow/50" />
            <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-yellow/50" />

            <div className="flex flex-col items-center gap-5">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 flex items-center justify-center font-pixel text-white text-xl border-2 border-border shadow-pixel"
                  style={{ backgroundColor: color }}
                >
                  {initials(name)}
                </div>
                <span className="font-pixel text-[7px] text-muted">{name}</span>
              </div>

              <div className="w-full space-y-2">
                <label className="font-pixel text-[7px] text-yellow/70 flex items-center gap-1.5">
                  <span>▸</span> CHOOSE COLOR
                </label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`
                        w-9 h-9 border-2 flex items-center justify-center font-pixel text-[9px] transition-all
                        ${color === c
                          ? 'border-white scale-110 shadow-pixel-sm'
                          : 'border-transparent hover:border-white/40 hover:scale-105'}
                      `}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    >
                      {color === c && (
                        <span style={{ color: '#fff', textShadow: '1px 1px 0 rgba(0,0,0,0.7)' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-pixel text-[7px] text-yellow/70 flex items-center gap-1.5">
                <span>▸</span> YOUR SKILLS
              </label>
              {skills.length > 0 && (
                <span className="font-pixel text-[6px] text-yellow">{skills.length} SELECTED</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`
                    font-pixel text-[7px] px-3 py-2.5 border-2 transition-all flex items-center gap-1.5
                    ${skills.includes(skill)
                      ? 'border-yellow text-yellow bg-yellow/10 shadow-pixel-sm'
                      : 'border-border text-muted hover:border-muted hover:text-text'}
                  `}
                >
                  <span className="w-2 shrink-0 text-center">{skills.includes(skill) ? '▸' : ''}</span>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full font-pixel text-[10px] text-base bg-yellow py-4 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-0.5 hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all duration-75"
          >
            LET'S BUILD →
          </button>

          <button
            onClick={() => setStep(1)}
            className="font-pixel text-[8px] text-muted hover:text-yellow transition-colors"
          >
            ← BACK
          </button>
        </div>
      )}
    </div>
  )
}
