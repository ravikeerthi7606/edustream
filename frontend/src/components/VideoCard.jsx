import { Play, Eye, Clock, User, Trash2 } from 'lucide-react'
import { useState } from 'react'

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function VideoCard({ video, onClick, onDelete, showDelete }) {
  const [hovered, setHovered] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this video?')) return
    setDeleting(true)
    try { await onDelete(video.id) } finally { setDeleting(false) }
  }

  return (
    <div
      onClick={() => onClick(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(99,102,241,0.15)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        aspectRatio: '16/9',
        background: 'linear-gradient(135deg, #1a1d2e 0%, #0f1117 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)`,
        }} />
        <div style={{
          width: 56, height: 56,
          background: hovered ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}>
          <Play size={22} color="white" fill="white" style={{ marginLeft: 3 }} />
        </div>

        {video.subject && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'var(--accent)',
            color: 'white',
            fontSize: 11, fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 20,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>{video.subject}</span>
        )}

        <span style={{
          position: 'absolute', bottom: 12, right: 12,
          background: 'rgba(0,0,0,0.7)',
          color: 'var(--text-dim)',
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 4,
        }}>{formatSize(video.file_size)}</span>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{
          fontSize: 15, fontWeight: 600,
          marginBottom: 6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}>{video.title}</h3>

        {video.description && (
          <p style={{
            fontSize: 13, color: 'var(--text-muted)',
            marginBottom: 10,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
          }}>{video.description}</p>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <User size={12} />{video.teacher_name}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <Eye size={12} />{video.views}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <Clock size={12} />{formatDate(video.created_at)}
            </span>
            {showDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: 'transparent', border: 'none',
                  color: deleting ? 'var(--text-muted)' : 'var(--danger)',
                  cursor: 'pointer', padding: 4, borderRadius: 4,
                  display: 'flex', alignItems: 'center',
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}