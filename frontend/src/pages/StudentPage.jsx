import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Video, Filter } from 'lucide-react'
import api from '../utils/api'
import VideoCard from '../components/VideoCard'
import VideoPlayer from '../components/VideoPlayer'
import { useAuth } from '../context/AuthContext'

const SUBJECTS = ['All', 'Math', 'Science', 'English', 'History', 'Programming', 'Art', 'Music', 'Other']

export default function StudentPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [subject, setSubject] = useState('')
  const [page, setPage] = useState(1)
  const [selectedVideo, setSelectedVideo] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['videos', page, search, subject],
    queryFn: () => api.get('/videos', { params: { page, per_page: 12, search: search || undefined, subject: subject || undefined } }).then(r => r.data),
    keepPreviousData: true,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleSubject = (s) => {
    setSubject(s === 'All' ? '' : s)
    setPage(1)
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Discover videos and keep learning.</p>
      </div>

      {/* Search & filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 260, display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search videos..."
              style={{
                width: '100%', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 10,
                padding: '11px 16px 11px 42px', color: 'var(--text)', fontSize: 14,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button type="submit" style={{
            background: 'var(--accent)', color: 'white', border: 'none',
            borderRadius: 10, padding: '0 20px', fontWeight: 600, cursor: 'pointer',
            fontSize: 14,
          }}>Search</button>
        </form>
      </div>

      {/* Subject pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => handleSubject(s)} style={{
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: (subject === '' && s === 'All') || subject === s ? 'var(--accent)' : 'var(--bg-card)',
            color: (subject === '' && s === 'All') || subject === s ? 'white' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            transition: 'all 0.2s',
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* Videos grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 0 }} />
              <div style={{ padding: 16, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 18, width: '80%' }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          Failed to load videos. Please try again.
        </div>
      ) : data?.videos?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Video size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>No videos found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {data?.total} video{data?.total !== 1 ? 's' : ''} found
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {data?.videos?.map(video => (
              <VideoCard key={video.id} video={video} onClick={setSelectedVideo} />
            ))}
          </div>

          {/* Pagination */}
          {data?.total_pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '8px 18px', borderRadius: 8, cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: page <= 1 ? 'var(--text-muted)' : 'var(--text)', fontSize: 14,
                }}
              >Previous</button>
              <span style={{
                padding: '8px 18px', fontSize: 14, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
              }}>Page {page} of {data?.total_pages}</span>
              <button
                disabled={page >= data?.total_pages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '8px 18px', borderRadius: 8,
                  cursor: page >= data?.total_pages ? 'not-allowed' : 'pointer',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: page >= data?.total_pages ? 'var(--text-muted)' : 'var(--text)', fontSize: 14,
                }}
              >Next</button>
            </div>
          )}
        </>
      )}

      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  )
}