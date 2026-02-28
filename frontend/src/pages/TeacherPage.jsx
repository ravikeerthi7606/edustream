import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Video, Eye, TrendingUp, Upload, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import VideoCard from '../components/VideoCard'
import VideoPlayer from '../components/VideoPlayer'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, background: color,
        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

export default function TeacherPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [selectedVideo, setSelectedVideo] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-videos', page],
    queryFn: () => api.get('/videos/my', { params: { page, per_page: 12 } }).then(r => r.data),
    keepPreviousData: true,
  })

  const handleDelete = async (videoId) => {
    try {
      await api.delete(`/videos/${videoId}`)
      toast.success('Video deleted')
      queryClient.invalidateQueries(['my-videos'])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete video')
    }
  }

  const totalViews = data?.videos?.reduce((sum, v) => sum + v.views, 0) ?? 0

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16, animation: 'fadeIn 0.4s ease' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            Your Dashboard, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Manage your video library and track performance.</p>
        </div>
        <Link to="/teacher/upload" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--accent)', color: 'white',
          padding: '12px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          transition: 'background 0.2s',
        }}>
          <Plus size={18} /> Upload Video
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
        <StatCard
          icon={<Video size={22} color="#6366f1" />}
          label="Total Videos"
          value={data?.total ?? '—'}
          color="rgba(99,102,241,0.12)"
        />
        <StatCard
          icon={<Eye size={22} color="#10b981" />}
          label="Total Views"
          value={totalViews}
          color="rgba(16,185,129,0.12)"
        />
        <StatCard
          icon={<TrendingUp size={22} color="#f59e0b" />}
          label="Avg Views/Video"
          value={data?.total ? Math.round(totalViews / data.total) : 0}
          color="rgba(245,158,11,0.12)"
        />
      </div>

      {/* Videos */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Your Videos</h2>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 0 }} />
              <div style={{ padding: 16, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 18, width: '80%' }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : data?.videos?.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}>
          <Upload size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>No videos yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Upload your first video to get started.</p>
          <Link to="/teacher/upload" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', color: 'white',
            padding: '12px 24px', borderRadius: 10, fontWeight: 600,
          }}>
            <Upload size={16} /> Upload Now
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {data?.videos?.map(video => (
              <VideoCard
                key={video.id} video={video}
                onClick={setSelectedVideo}
                onDelete={handleDelete}
                showDelete
              />
            ))}
          </div>

          {data?.total_pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{
                padding: '8px 18px', borderRadius: 8, cursor: page <= 1 ? 'not-allowed' : 'pointer',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: page <= 1 ? 'var(--text-muted)' : 'var(--text)', fontSize: 14,
              }}>Previous</button>
              <span style={{ padding: '8px 18px', fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                Page {page} of {data?.total_pages}
              </span>
              <button disabled={page >= data?.total_pages} onClick={() => setPage(p => p + 1)} style={{
                padding: '8px 18px', borderRadius: 8,
                cursor: page >= data?.total_pages ? 'not-allowed' : 'pointer',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: page >= data?.total_pages ? 'var(--text-muted)' : 'var(--text)', fontSize: 14,
              }}>Next</button>
            </div>
          )}
        </>
      )}

      {selectedVideo && <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </div>
  )
}