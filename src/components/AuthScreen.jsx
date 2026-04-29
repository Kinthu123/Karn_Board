import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState('signin') // 'signin' | 'signup'
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
        const { error } = await supabase.auth.signUp({ email, password })
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
      <div className="fixed inset-0 bg-base flex flex-col items-center justify-center gap-8 px-6 animate-fade-in">
        <div className="text-center space-y-4 max-w-sm w-full">
          <div className="font-pixel text-yellow text-2xl">✉</div>
          <h1 className="font-pixel text-yellow text-[11px] leading-loose">CHECK YOUR EMAIL</h1>
          <p className="font-sans text-muted text-sm leading-relaxed">
            We sent a confirmation link to <span className="text-text">{email}</span>.
            Click it to activate your account, then come back and sign in.
          </p>
        </div>
        <button
          onClick={() => { setConfirm(false); setMode('signin') }}
          className="font-pixel text-[9px] text-muted hover:text-yellow transition-colors"
        >
          ← BACK TO SIGN IN
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-base flex flex-col items-center justify-center px-6 animate-fade-in">

      <div className="w-full max-w-sm flex flex-col gap-8">

      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="font-pixel text-yellow text-base">KARN</span>
          <span className="font-pixel text-text text-base">BOARD</span>
        </div>
        <p className="font-sans text-muted text-sm">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">

        <div className="space-y-1.5">
          <label className="font-pixel text-[8px] text-muted">EMAIL</label>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="you@example.com"
            className="w-full bg-card border-2 border-border px-4 py-3 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-pixel text-[8px] text-muted">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
            className="w-full bg-card border-2 border-border px-4 py-3 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
          />
        </div>

        {error && (
          <p className="font-pixel text-[8px] text-red leading-relaxed">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full font-pixel text-[10px] text-base bg-yellow py-4 border-2 border-yellow-dark shadow-pixel hover:-translate-y-0.5 hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? '...'
            : mode === 'signup' ? 'CREATE ACCOUNT →' : 'SIGN IN →'
          }
        </button>
      </form>

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
