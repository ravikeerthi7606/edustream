import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { BookOpen, Play, Upload, Users, Video, TrendingUp, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '80px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-glow)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 28,
            fontSize: 13, color: 'var(--accent)', fontWeight: 500,
          }}>
            <TrendingUp size={14} /> Learning Made Simple
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800, lineHeight: 1.05,
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}>
            The smarter way to<br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>learn & teach</span>
          </h1>

          <p style={{
            fontSize: 18, color: 'var(--text-muted)',
            maxWidth: 500, margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            Stream educational videos, track your progress, and learn at your own pace — all in one beautiful platform.
          </p>

          {user ? (
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={user.role === 'teacher' ? '/teacher' : '/student'} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--accent)', color: 'white',
                padding: '14px 28px', borderRadius: 12,
                fontWeight: 600, fontSize: 15, transition: 'all 0.2s',
              }}>
                {user.role === 'teacher' ? <><Upload size={18} />My Dashboard</> : <><Play size={18} />Browse Videos</>}
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--accent)', color: 'white',
                padding: '14px 28px', borderRadius: 12,
                fontWeight: 600, fontSize: 15,
              }}>
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link to="/login" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-elevated)', color: 'var(--text)',
                border: '1px solid var(--border)',
                padding: '14px 28px', borderRadius: 12,
                fontWeight: 600, fontSize: 15,
              }}>
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            {
              icon: <Play size={24} color="var(--accent)" />,
              title: 'HD Video Streaming',
              desc: 'Buffer-free HTTP range streaming with adaptive quality. Watch any video without interruption.',
              color: 'rgba(99,102,241,0.1)',
            },
            {
              icon: <Upload size={24} color="var(--success)" />,
              title: 'Easy Video Upload',
              desc: 'Teachers can upload videos in minutes with drag-and-drop. Organize by subject and description.',
              color: 'rgba(16,185,129,0.1)',
            },
            {
              icon: <Users size={24} color="var(--warning)" />,
              title: 'Student & Teacher Roles',
              desc: 'Separate accounts for students and teachers, each with tailored dashboards and permissions.',
              color: 'rgba(245,158,11,0.1)',
            },
            {
              icon: <Video size={24} color="#ec4899" />,
              title: 'Cloud-Ready Architecture',
              desc: 'Built to scale from local storage to AWS S3. Switch backends with a single config change.',
              color: 'rgba(236,72,153,0.1)',
            },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: 48, height: 48, background: color,
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}