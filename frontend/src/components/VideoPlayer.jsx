import { X, Eye, User, BookOpen } from 'lucide-react'
import { useEffect, useRef } from 'react'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function VideoPlayer({ video, onClose }) {
  const overlayRef = useRef()

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!video) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 960,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, flex: 1, marginRight: 16 }}
            className="truncate">{video.title}</h2>
          <button onClick={onClose} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 8, color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          ><X size={18} /></button>
        </div>

        {/* Video */}
        <div style={{ background: '#000', aspectRatio: '16/9' }}>
          <video
            src={video.video_url}
            controls
            autoPlay
            style={{ width: '100%', height: '100%', display: 'block' }}
            onError={(e) => console.error('Video error', e)}
          >
            Your browser does not support HTML5 video.
          </video>
        </div>

        {/* Meta */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
            {video.subject && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--accent)',
                background: 'var(--accent-glow)', padding: '4px 12px', borderRadius: 20,
                fontWeight: 600,
              }}>
                <BookOpen size={13} />{video.subject}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <User size={13} />{video.teacher_name}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <Eye size={13} />{video.views} views
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(video.created_at)}</span>
          </div>
          {video.description && (
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>{video.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}