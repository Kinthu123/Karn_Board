import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── 6-box OTP input ────────────────────────────────────────────────
function OtpInput({ onChange, resetCount }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const refs = useRef([])

  useEffect(() => {
    setDigits(['', '', '', '', '', ''])
    refs.current[0]?.focus()
  }, [resetCount])

  function push(next) {
    setDigits(next)
    onChange(next.join(''))
  }

  function handleChange(i, e) {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = char
    push(next)
    if (char && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      const next = [...digits]
      if (digits[i]) {
        next[i] = ''
        push(next)
      } else if (i > 0) {
        next[i - 1] = ''
        push(next)
        refs.current[i - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft'  && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array.from({ length: 6 }, (_, k) => pasted[k] ?? '')
    push(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={i === 0}
          className={`
            w-11 h-14 text-center font-pixel text-sm bg-base border-2
            focus:outline-none transition-colors shadow-pixel-sm
            ${d ? 'border-yellow/60 text-yellow' : 'border-border text-muted'}
            focus:border-yellow
          `}
        />
      ))}
    </div>
  )
}

// ── Auth screen ────────────────────────────────────────────────────
export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [confirm, setConfirm]   = useState(false)
  const [otp, setOtp]           = useState('')
  const [verifying, setVerifying] = useState(false)
  const [otpReset, setOtpReset] = useState(0)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown(c => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) throw error
        setOtp('')
        setOtpReset(r => r + 1)
        setConfirm(true)
        setCooldown(60)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.user)
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (otp.length !== 6) return
    setError('')
    setVerifying(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      })
      if (error) throw error
      onAuth(data.user)
    } catch (err) {
      setError(err.message ?? 'Invalid code. Please try again.')
      setOtp('')
      setOtpReset(r => r + 1)
    } finally {
      setVerifying(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setError('')
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      setCooldown(60)
    } catch (err) {
      setError(err.message ?? 'Could not resend code.')
    }
  }

  // ── OTP verification screen ──────────────────────────────────────
  if (confirm) {
    return (
      <div className="fixed inset-0 dot-grid bg-base flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="relative bg-card border-2 border-yellow/40 p-8 max-w-sm w-full shadow-pixel space-y-7">
          <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-yellow" />
          <div className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-yellow" />
          <div className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-yellow" />
          <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-yellow" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="font-pixel text-yellow text-2xl">✉</div>
            <h1 className="font-pixel text-yellow text-[10px] leading-loose">CONFIRM EMAIL</h1>
            <p className="font-sans text-muted text-sm leading-relaxed">
              Enter the 6-digit code sent to{' '}
              <span className="text-yellow font-medium break-all">{email}</span>
            </p>
          </div>

          {/* OTP form */}
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <OtpInput onChange={setOtp} resetCount={otpReset} />

            {error && (
              <div className="border border-red/40 bg-red/5 px-3 py-2.5">
                <p className="font-pixel text-[7px] text-red leading-relaxed">⚠ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={otp.length !== 6 || verifying}
              className="w-full font-pixel text-[10px] text-base bg-yellow py-4 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-0.5 hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {verifying ? '▌ ▌ ▌' : 'VERIFY CODE →'}
            </button>
          </form>

          <p className="font-sans text-border text-xs text-center leading-relaxed">
            Check spam if you don't see it. The code expires in 1 hour.
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setConfirm(false); setMode('signin'); setError('') }}
              className="font-pixel text-[7px] text-muted hover:text-yellow transition-colors"
            >
              ← BACK
            </button>
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="font-pixel text-[7px] text-muted hover:text-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `RESEND (${cooldown}s)` : 'RESEND CODE'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Sign in / Sign up screen ─────────────────────────────────────
  return (
    <div className="fixed inset-0 dot-grid bg-base flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-sm flex flex-col gap-7">

        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="font-pixel text-yellow text-2xl glow-yellow">KARN</span>
            <span className="font-pixel text-text text-2xl">BOARD</span>
            <span className="font-pixel text-yellow text-2xl animate-blink" style={{ lineHeight: 1 }}>▌</span>
          </div>
          <div className="flex justify-center">
            <span className="font-pixel text-[7px] text-muted tracking-widest border border-border px-4 py-1.5">
              LEVEL UP YOUR PROJECTS
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="font-pixel text-[7px] text-border">
            {mode === 'signup' ? 'NEW PLAYER' : 'RETURNING'}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form card */}
        <div className="relative bg-card border-2 border-border p-6 shadow-pixel">
          <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-yellow/50" />
          <div className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-yellow/50" />
          <div className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-yellow/50" />
          <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-yellow/50" />

          <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
            <div className="space-y-1.5">
              <label className="font-pixel text-[7px] text-yellow/70 flex items-center gap-1.5">
                <span>▸</span> EMAIL
              </label>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                className="w-full bg-base border-2 border-border px-4 py-3 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-pixel text-[7px] text-yellow/70 flex items-center gap-1.5">
                <span>▸</span> PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                className="w-full bg-base border-2 border-border px-4 py-3 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
              />
            </div>

            {error && (
              <div className="border border-red/40 bg-red/5 px-3 py-2.5">
                <p className="font-pixel text-[7px] text-red leading-relaxed">⚠ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full font-pixel text-[10px] text-base bg-yellow py-4 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-0.5 hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-1"
            >
              {loading ? '▌ ▌ ▌' : mode === 'signup' ? 'CREATE ACCOUNT →' : 'SIGN IN →'}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-2">
          <span className="font-sans text-muted text-sm">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="font-pixel text-[8px] text-yellow hover:text-yellow/80 transition-colors"
          >
            {mode === 'signup' ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </div>

      </div>
    </div>
  )
}
