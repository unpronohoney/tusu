import { useState, useEffect } from 'react'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

const urlCache = new Map()

function useResolvedUrl(raw) {
  const [url, setUrl] = useState(() => (raw?.startsWith('gs://') ? urlCache.get(raw) ?? null : raw))
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (!raw) return
    if (!raw.startsWith('gs://')) { setUrl(raw); setErr(false); return }
    if (urlCache.has(raw)) { setUrl(urlCache.get(raw)); setErr(false); return }
    let cancel = false
    setUrl(null); setErr(false)
    getDownloadURL(ref(storage, raw))
      .then(u => { if (!cancel) { urlCache.set(raw, u); setUrl(u) } })
      .catch(e => { if (!cancel) { console.error('storage resolve failed', raw, e); setErr(true) } })
    return () => { cancel = true }
  }, [raw])

  return { url, err }
}

export default function PhotoCarousel({ photos = [] }) {
  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(false)

  const current = photos[idx]
  const { url, err } = useResolvedUrl(current)

  if (!photos.length) return (
    <div className="w-full h-48 flex items-center justify-center text-sm"
      style={{ background: '#f2efe9', color: '#c4bdb5' }}>
      fotoğraf yok
    </div>
  )

  const prev = () => { setIdx(i => (i - 1 + photos.length) % photos.length); setFailed(false) }
  const next = () => { setIdx(i => (i + 1) % photos.length); setFailed(false) }

  const showError = failed || err

  return (
    <div className="relative w-full overflow-hidden group" style={{ aspectRatio: '16/9', background: '#f2efe9' }}>
      {showError ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-xs gap-1" style={{ color: '#c4bdb5' }}>
          <span>fotoğraf yüklenemedi</span>
          <code className="px-2 py-0.5 rounded text-[10px] break-all" style={{ background: '#ffffff', color: '#9a8f87', maxWidth: '80%' }}>
            {current}
          </code>
        </div>
      ) : !url ? (
        <div className="w-full h-full flex items-center justify-center text-xs soft-pulse" style={{ color: '#9a8f87' }}>
          yükleniyor…
        </div>
      ) : (
        <img
          src={url}
          alt={`Fotoğraf ${idx + 1}`}
          className="w-full h-full object-cover carousel-img"
          key={idx}
          onError={() => setFailed(true)}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {photos.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow transition opacity-0 group-hover:opacity-100"
            style={{ color: '#1e1916' }}>
            ‹
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow transition opacity-0 group-hover:opacity-100"
            style={{ color: '#1e1916' }}>
            ›
          </button>

          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button key={i} onClick={() => { setIdx(i); setFailed(false) }}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/60 w-1.5'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
