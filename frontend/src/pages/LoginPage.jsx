import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { BookOpen, Eye, EyeOff, GraduationCap, Presentation } from 'lucide-react'

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Watch & learn', icon: GraduationCap },
  { value: 'teacher', label: 'Teacher', desc: 'Upload & teach', icon: Presentation },
]

export default function LoginPage({ mode = 'login' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const isRegister = mode === 'register'

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let user
      if (isRegister) {
        user = await register(form.name, form.email, form.password, form.role)
        toast.success(`Welcome, ${user.name}!`)
      } else {
        user = await login(form.email, form.password, form.role)
        toast.success(`Welcome back, ${user.name}!`)
      }
      navigate(user.role === 'teacher' ? '/teacher' : '/student')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: 15,
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'none',
        background: 'linear-gradient(135deg, #0d0f1a 0%, #111827 100%)',
        padding: 60,
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }} className="left-panel">
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: -50,
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
          <div style={{
            width: 44, height: 44, background: 'var(--accent)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={22} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700 }}>EduStream</span>
        </div>

        <div style={{ zIndex: 1 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Learn without<br />
            <span style={{ color: 'var(--accent)' }}>limits.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 380 }}>
            Stream high-quality educational videos from expert teachers. Build your knowledge at your own pace.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 32, zIndex: 1 }}>
          {[['500+', 'Videos'], ['200+', 'Teachers'], ['10k+', 'Students']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>{n}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 440, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 56, height: 56, background: 'var(--accent)',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <BookOpen size={26} color="white" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              {isRegister ? 'Create account' : 'Welcome back'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              {isRegister ? 'Start your learning journey today' : 'Sign in to continue learning'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Role selector */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 8, display: 'block' }}>
                I am a...
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ROLES.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                    style={{
                      padding: '14px 16px',
                      background: form.role === value ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                      border: `1px solid ${form.role === value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 10,
                      color: form.role === value ? 'var(--accent)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <Icon size={18} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {isRegister && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6, display: 'block' }}>Full Name</label>
                <input
                  name="name" value={form.name} onChange={handleChange} required
                  placeholder="John Doe" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6, display: 'block' }}>Email Address</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handleChange} required
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle, paddingRight: 46 }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '14px', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? (
                <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'block' }} />Processing...</>
              ) : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isRegister ? '/login' : '/register'} style={{ color: 'var(--accent)', fontWeight: 600 }}>
              {isRegister ? 'Sign in' : 'Sign up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}