import { useEffect, useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, storage, authReady } from '../firebase'

const extToMime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif', gif: 'image/gif' }

function todayISO() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function CreateEventModal({ onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateStr, setDateStr] = useState(todayISO())
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(null)
  const [err, setErr] = useState(null)

  // Esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, saving])

  // Build preview URLs
  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(u => URL.revokeObjectURL(u))
  }, [files])

  function handleFilesPicked(e) {
    const picked = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...picked])
    e.target.value = ''
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !dateStr) {
      setErr('başlık ve tarih şart')
      return
    }
    setErr(null)
    setSaving(true)
    setProgress({ done: 0, total: files.length })
    try {
      await authReady
      const dateObj = new Date(dateStr + 'T12:00:00')

      // 1) Create event doc (without photos first to get an id)
      const ref = await addDoc(collection(db, 'events'), {
        title: title.trim(),
        description: description.trim(),
        date: Timestamp.fromDate(dateObj),
        photos: [],
        hasSubEvents: false,
        createdAt: Timestamp.now(),
      })

      // 2) Upload photos (if any) and collect gs:// urls
      const gsUrls = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'jpg'
          const path = `events/${ref.id}/${Date.now()}_${i}.${ext}`
          const r = storageRef(storage, path)
          const contentType = file.type && file.type.startsWith('image/')
            ? file.type
            : (extToMime[ext] || 'image/jpeg')
          await uploadBytes(r, file, { contentType })
          gsUrls.push(`gs://${r.bucket}/${path}`)
        } catch (uerr) {
          console.error('upload failed for', file.name, uerr)
        } finally {
          setProgress(p => ({ ...p, done: i + 1 }))
        }
      }

      // 3) Update doc with photo array (if any uploaded)
      if (gsUrls.length) {
        const { doc, updateDoc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'events', ref.id), { photos: gsUrls })
      }

      onClose()
    } catch (error) {
      console.error('event create failed', error)
      setErr(error.message || 'oluşturulamadı')
    } finally {
      setSaving(false)
      setProgress(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(10,8,7,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={() => !saving && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col gap-4 p-6"
        style={{ background: '#ffffff', fontFamily: 'Montserrat, sans-serif' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: '#1e1916' }}>yeni anı ekle</h2>
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 hover:scale-110"
            style={{ background: '#f2efe9', color: '#7a706b' }}
            aria-label="kapat"
          >
            ✕
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: '#7a706b' }}>başlık</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ör. ilk buluşmamız"
            className="rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
            style={{ background: '#faf9f6', border: '1.5px solid #e0d6cc', color: '#1e1916' }}
            disabled={saving}
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: '#7a706b' }}>açıklama (isteğe bağlı)</span>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="kısa bir not…"
            className="rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
            style={{ background: '#faf9f6', border: '1.5px solid #e0d6cc', color: '#1e1916', fontFamily: 'inherit' }}
            disabled={saving}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: '#7a706b' }}>tarih</span>
          <input
            type="date"
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
            className="rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
            style={{ background: '#faf9f6', border: '1.5px solid #e0d6cc', color: '#1e1916' }}
            disabled={saving}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium" style={{ color: '#7a706b' }}>fotoğraflar (isteğe bağlı)</span>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden" style={{ background: '#f2efe9' }}>
                  <img src={src} alt={`önizleme ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    disabled={saving}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all active:scale-90"
                    style={{ background: 'rgba(30,25,22,0.8)', color: '#ffffff' }}
                    aria-label="kaldır"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            className={`text-xs font-medium px-3 py-2 rounded-xl text-center cursor-pointer transition-all active:scale-95 ${saving ? 'opacity-50 pointer-events-none' : ''}`}
            style={{ background: '#f2efe9', color: '#1e1916', border: '1.5px dashed #c4bdb5' }}
          >
            ＋ {previews.length ? 'daha ekle' : 'fotoğraf seç'}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesPicked}
              disabled={saving}
            />
          </label>
        </div>

        {err && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
            {err}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => !saving && onClose()}
            disabled={saving}
            className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            style={{ background: '#f2efe9', color: '#1e1916' }}
          >
            iptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            style={{ background: '#1e1916', color: '#f2efe9' }}
          >
            {saving
              ? (progress && progress.total ? `yükleniyor ${progress.done}/${progress.total}` : 'kaydediliyor…')
              : 'kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
