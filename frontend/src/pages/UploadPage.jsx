import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, File, X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Programming', 'Art', 'Music', 'Physics', 'Chemistry', 'Biology', 'Other']

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', subject: '' })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploaded, setUploaded] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0]
    if (f) {
      setFile(f)
      if (!form.title) setForm(prev => ({ ...prev, title: f.name.replace(/\.[^/.]+$/, '') }))
    }
  }, [form.title])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv'] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  })

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a video file')
    if (!form.title.trim()) return toast.error('Title is required')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('subject', form.subject)

    setUploading(true)
    setProgress(0)

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setProgress(pct)
        },
        timeout: 600000, // 10 min for large files
      })
      setUploaded(true)
      queryClient.invalidateQueries(['my-videos'])
      toast.success('Video uploaded successfully!')
      setTimeout(() => navigate('/teacher'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
      setUploading(false)
      setProgress(0)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 16px',
    color: 'var(--text)', fontSize: 15,
    transition: 'border-color 0.2s',
  }

  if (uploaded) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Upload Successful!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Redirecting to your dashboard...</p>
          <div style={{
            width: 200, height: 4,
            background: 'var(--bg-elevated)', borderRadius: 2, margin: '20px auto 0',
            overflow: 'hidden',
          }}>
            <div style={{ height: '100%', background: 'var(--success)', borderRadius: 2, animation: 'shimmer 1.5s ease', width: '100%' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}>
      <button onClick={() => navigate('/teacher')} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'none', color: 'var(--text-muted)',
        marginBottom: 28, fontSize: 14, cursor: 'pointer',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Upload Video</h1>
        <p style={{ color: 'var(--text-muted)' }}>Share your knowledge with students.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Dropzone */}
        <div {...getRootProps()} style={{
          border: `2px dashed ${isDragActive ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'var(--accent-glow)' : file ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)',
          transition: 'all 0.2s',
        }}>
          <input {...getInputProps()} />
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <File size={40} color="var(--success)" />
              <div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{file.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{formatSize(file.size)}</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                fontSize: 13, color: 'var(--text-muted)',
              }}>
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 64, height: 64,
                background: isDragActive ? 'var(--accent)' : 'var(--bg-elevated)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <Upload size={26} color={isDragActive ? 'white' : 'var(--text-muted)'} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                  {isDragActive ? 'Drop your video here' : 'Drag & drop a video'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  or <span style={{ color: 'var(--accent)', fontWeight: 500 }}>click to browse</span>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                  MP4, WebM, OGG, AVI, MOV, MKV — max 500MB
                </p>
              </div>
            </div>
          )}
        </div>

        {fileRejections.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '12px 16px', color: 'var(--danger)', fontSize: 14,
          }}>
            <AlertCircle size={16} />
            {fileRejections[0]?.errors[0]?.message || 'Invalid file'}
          </div>
        )}

        {/* Title */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 8, display: 'block' }}>
            Title <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            name="title" value={form.title} onChange={handleChange} required
            placeholder="Enter video title..."
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Subject */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 8, display: 'block' }}>Subject</label>
          <select
            name="subject" value={form.subject} onChange={handleChange}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          >
            <option value="">Select a subject...</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 8, display: 'block' }}>Description</label>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            placeholder="Describe what students will learn..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Progress bar while uploading */}
        {uploading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Uploading...</span>
              <span style={{ fontWeight: 600 }}>{progress}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'var(--accent)', borderRadius: 4,
                width: `${progress}%`, transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={uploading || !file} style={{
          background: uploading || !file ? 'var(--bg-elevated)' : 'var(--accent)',
          color: uploading || !file ? 'var(--text-muted)' : 'white',
          border: 'none', borderRadius: 12, padding: '16px',
          fontSize: 16, fontWeight: 600,
          cursor: uploading || !file ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}>
          {uploading ? (
            <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--text-muted)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />Uploading {progress}%</>
          ) : (
            <><Upload size={18} />Upload Video</>
          )}
        </button>
      </form>
    </div>
  )
}