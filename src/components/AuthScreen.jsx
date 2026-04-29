import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [confirm, setConfirm]   = useState(false)

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
        setConfirm(true)
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

  if (confirm) {
    return (
      <div className="fixed inset-0 dot-grid bg-base flex flex-col items-center justify-center gap-8 px-6 animate-fade-in">
        <div className="relative bg-card border-2 border-yellow/40 p-10 max-w-sm w-full text-center space-y-6 shadow-pixel">
          <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-yellow" />
          <div className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-yellow" />
          <div className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-yellow" />
          <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-yellow" />

          <div className="font-pixel text-yellow text-3xl animate-blink">✉</div>
          <h1 className="font-pixel text-yellow text-[10px] leading-loose">CHECK YOUR EMAIL</h1>
          <p className="font-sans text-muted text-sm leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="text-yellow font-medium">{email}</span>.
            Click it to activate your account, then come back and sign in.
          </p>
          <button
            onClick={() => { setConfirm(false); setMode('signin') }}
            className="font-pixel text-[8px] text-muted hover:text-yellow transition-colors"
          >
            ← BACK TO SIGN IN
          </button>
        </div>
      </div>
    )
  }

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
