import { useEffect, useState } from 'react'

export default function Lightbox({ url, filename = 'foto.jpg', onClose, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  async function handleDownload(e) {
    e.stopPropagation()
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(objUrl), 1000)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,8,7,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <img
        src={url}
        alt="Büyük görünüm"
        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleDownload}
          className="text-sm font-medium px-5 py-2.5 rounded-full flex items-center gap-2 transition-all active:scale-95 hover:scale-105"
          style={{ background: '#ffffff', color: '#1e1916', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
        >
          ↓ indir
        </button>

        {onDelete && (
          confirming ? (
            <>
              <button
                onClick={async () => {
                  if (deleting) return
                  setDeleting(true)
                  try { await onDelete() } catch (err) { console.error(err); setDeleting(false); setConfirming(false) }
                }}
                className="text-sm font-medium px-4 py-2.5 rounded-full transition-all active:scale-95 disabled:opacity-60"
                style={{ background: '#c4463b', color: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                disabled={deleting}
              >
                {deleting ? 'siliniyor…' : 'evet, sil'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-sm font-medium px-4 py-2.5 rounded-full transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', backdropFilter: 'blur(8px)' }}
              >
                iptal
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-sm font-medium px-5 py-2.5 rounded-full transition-all active:scale-95 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              🗑 sil
            </button>
          )
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-all active:scale-90 hover:scale-110"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        aria-label="kapat"
      >
        ✕
      </button>
    </div>
  )
}
