import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import PhotoCarousel from './PhotoCarousel'
import SubEventCard from './SubEventCard'
import DualRating from './DualRating'

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getDate(ts) {
  if (!ts) return new Date(0)
  return ts.toDate ? ts.toDate() : new Date(ts)
}

function relativeDays(ts) {
  if (!ts) return ''
  const d = getDate(ts)
  const now = new Date()
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOf(d) - startOf(now)) / 86400000)
  if (diffDays === 0) return 'bugün'
  if (diffDays === 1) return 'yarın'
  if (diffDays === -1) return 'dün'
  if (diffDays > 1) return `${diffDays} gün sonra`
  return `${Math.abs(diffDays)} gün önce`
}

function avgFromSubs(arr) {
  const ratings = []
  for (const s of arr) {
    if (s.rating != null) ratings.push(s.rating)
    if (s.rating_mirza != null) ratings.push(s.rating_mirza)
  }
  if (!ratings.length) return null
  return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10
}

function avgFromSelf(e) {
  const r = []
  if (e.rating != null) r.push(e.rating)
  if (e.rating_mirza != null) r.push(e.rating_mirza)
  if (!r.length) return null
  return Math.round(r.reduce((a, b) => a + b, 0) / r.length * 10) / 10
}

export default function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false)
  const [subEvents, setSubEvents] = useState([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const fileInputRef = useRef(null)

  const hasSubEvents = event.hasSubEvents
  const isFuture = getDate(event.date) > new Date()

  useEffect(() => {
    if (!hasSubEvents) return
    setLoadingSubs(true)
    const unsub = onSnapshot(collection(db, 'events', event.id, 'subEvents'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setSubEvents(docs)
      setLoadingSubs(false)
    })
    return unsub
  }, [hasSubEvents, event.id])

  const avgRating = hasSubEvents ? avgFromSubs(subEvents) : avgFromSelf(event)

  async function saveDirect(fields) {
    await updateDoc(doc(db, 'events', event.id), fields)
  }

  async function handleDeletePhoto(photoUrl) {
    try {
      await updateDoc(doc(db, 'events', event.id), { photos: arrayRemove(photoUrl) })
      try {
        await deleteObject(storageRef(storage, photoUrl))
      } catch (err) {
        console.warn('storage delete failed (file may already be gone)', err)
      }
    } catch (err) {
      console.error('delete failed', err)
      throw err
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadErr(null)
    setUploading(true)
    try {
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
      const path = `events/${event.id}/${Date.now()}.${ext}`
      const r = storageRef(storage, path)
      await uploadBytes(r, file)
      const gsUrl = `gs://${r.bucket}/${path}`
      await updateDoc(doc(db, 'events', event.id), { photos: arrayUnion(gsUrl) })
    } catch (err) {
      console.error('upload failed', err)
      setUploadErr(err.message || 'yükleme başarısız')
    } finally {
      setUploading(false)
    }
  }

  return (
    <article className="rounded-2xl overflow-hidden shadow-sm border transition-shadow hover:shadow-md"
      style={{ background: '#ffffff', borderColor: '#e5e0d8' }}>

      {event.photos?.length > 0 && (
        <PhotoCarousel photos={event.photos} onDelete={handleDeletePhoto} />
      )}

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
                style={{ background: '#f2efe9', color: '#7a706b' }}>
                {formatDate(event.date)}
              </span>
              {isFuture && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: '#dcecd8', color: '#3d7a3d' }}>
                  yakında
                </span>
              )}
            </div>
            <span className="text-[11px] pl-1" style={{ color: '#c4bdb5' }}>
              {relativeDays(event.date)}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1 ml-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-[11px] font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
              style={{ background: '#1e1916', color: '#f2efe9' }}>
              {uploading ? 'yükleniyor…' : '＋ fotoğraf'}
            </button>
            {uploadErr && (
              <span className="text-[10px]" style={{ color: '#c4847e' }}>{uploadErr}</span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold leading-snug" style={{ color: '#1e1916' }}>
            {event.title}
          </h2>
          {event.description && (
            <p className="text-sm mt-1 leading-relaxed" style={{ color: '#7a706b' }}>
              {event.description}
            </p>
          )}
        </div>

        {isFuture ? (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#9a8f87' }}>
              gerçekleştikten sonra beklerim 😇
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: '#9a8f87' }}>ortalama puan</span>
            {avgRating != null
              ? <span className="text-sm font-semibold px-2.5 py-0.5 rounded-lg"
                  style={{ background: '#fef3c7', color: '#92400e' }}>
                  ★ {avgRating}/10
                </span>
              : <span className="text-xs" style={{ color: '#c4bdb5' }}>henüz puan yok</span>
            }
          </div>
        )}

        {!isFuture && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="self-start text-xs font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95"
            style={{ background: '#f2efe9', color: '#1e1916' }}>
            {expanded ? '↑ kapat' : '↓ detayları gör'}
          </button>
        )}

        {expanded && !isFuture && (
          <div className="flex flex-col gap-3 slide-down border-t pt-4" style={{ borderColor: '#e5e0d8' }}>
            {hasSubEvents ? (
              <>
                {loadingSubs && (
                  <p className="text-xs text-center py-4 soft-pulse" style={{ color: '#9a8f87' }}>yükleniyor…</p>
                )}
                {!loadingSubs && subEvents.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: '#c4bdb5' }}>alt etkinlik bulunamadı</p>
                )}
                {subEvents.map(sub => (
                  <SubEventCard key={sub.id} sub={sub} eventId={event.id} />
                ))}
              </>
            ) : (
              <DualRating data={event} onSave={saveDirect} />
            )}
          </div>
        )}
      </div>
    </article>
  )
}
