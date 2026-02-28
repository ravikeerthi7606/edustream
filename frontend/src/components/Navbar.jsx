import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, BookOpen, Video, Home, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>
            EduStream
          </span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NavLink to="/" active={isActive('/')} icon={<Home size={16} />} label="Home" />
            {user.role === 'student' && (
              <NavLink to="/student" active={isActive('/student')} icon={<Video size={16} />} label="Videos" />
            )}
            {user.role === 'teacher' && (
              <>
                <NavLink to="/teacher" active={isActive('/teacher')} icon={<Video size={16} />} label="My Videos" />
                <NavLink to="/teacher/upload" active={isActive('/teacher/upload')} icon={<Upload size={16} />} label="Upload" />
              </>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginLeft: 16, paddingLeft: 16,
              borderLeft: '1px solid var(--border)',
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</div>
                <div style={{
                  fontSize: 11, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  fontWeight: 600,
                }}>{user.role}</div>
              </div>
              <button onClick={handleLogout} title="Logout" style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.color = 'var(--danger)'; e.target.style.borderColor = 'var(--danger)' }}
              onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, active, icon, label }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 14px',
      borderRadius: 8,
      fontSize: 14, fontWeight: 500,
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      background: active ? 'var(--accent-glow)' : 'transparent',
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {icon}{label}
    </Link>
  )
}