import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import PhotoCarousel from './PhotoCarousel'
import StarRating from './StarRating'
import SubEventCard from './SubEventCard'

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function avg(arr) {
  const rated = arr.filter(s => s.rating != null)
  if (!rated.length) return null
  return Math.round(rated.reduce((acc, s) => acc + s.rating, 0) / rated.length * 10) / 10
}

function getDate(ts) {
  if (!ts) return new Date(0)
  return ts.toDate ? ts.toDate() : new Date(ts)
}

export default function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false)
  const [subEvents, setSubEvents] = useState([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [hovered, setHovered] = useState(null)

  // Direct rating + comment state (for events without subEvents)
  const [rating, setRating] = useState(event.rating ?? null)
  const [comment, setComment] = useState(event.comment ?? '')
  const [savingRating, setSavingRating] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const lastSavedComment = useRef(event.comment ?? '')

  const hasSubEvents = event.hasSubEvents
  const isFuture = getDate(event.date) > new Date()

  useEffect(() => {
    if (!expanded || !hasSubEvents) return

    setLoadingSubs(true)
    const unsub = onSnapshot(collection(db, 'events', event.id, 'subEvents'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setSubEvents(docs)
      setLoadingSubs(false)
    })
    return unsub
  }, [expanded, hasSubEvents, event.id])

  const avgRating = hasSubEvents ? avg(subEvents) : null

  async function handleDirectRate(star) {
    if (isFuture) return
    setRating(star)
    setSavingRating(true)
    try {
      await updateDoc(doc(db, 'events', event.id), { rating: star })
    } finally {
      setSavingRating(false)
    }
  }

  async function handleCommentBlur() {
    const trimmed = comment.trim()
    if (trimmed === lastSavedComment.current) return
    setSavingComment(true)
    try {
      await updateDoc(doc(db, 'events', event.id), { comment: trimmed })
      lastSavedComment.current = trimmed
    } finally {
      setSavingComment(false)
    }
  }

  function handleSubRated(subId, star, c) {
    setSubEvents(prev => prev.map(s => s.id === subId ? { ...s, rating: star, comment: c } : s))
  }

  return (
    <article className="rounded-2xl overflow-hidden shadow-sm border transition-shadow hover:shadow-md"
      style={{ background: '#ffffff', borderColor: '#e5e0d8' }}>

      {event.photos?.length > 0 && (
        <PhotoCarousel photos={event.photos} />
      )}

      <div className="p-5 flex flex-col gap-4">
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
            <img
              src="https://i.kym-cdn.com/entries/icons/original/000/026/489/crying-cat-meme-i2.jpg"
              alt="henüz erken"
              className="w-8 h-8 rounded-lg object-cover"
              onError={e => { e.target.style.display = 'none' }}
            />
            <span className="text-xs" style={{ color: '#9a8f87' }}>
              gerçekleştikten sonra beklerim 😇
            </span>
          </div>
        ) : hasSubEvents ? (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#9a8f87' }}>ortalama puan</span>
            {avgRating != null
              ? <span className="text-sm font-semibold px-2.5 py-0.5 rounded-lg"
                  style={{ background: '#fef3c7', color: '#92400e' }}>
                  ★ {avgRating}/10
                </span>
              : <span className="text-xs" style={{ color: '#c4bdb5' }}>henüz puan yok</span>
            }
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating
                value={rating}
                onChange={handleDirectRate}
                hovered={hovered}
                onHover={setHovered}
              />
              {savingRating && <span className="text-xs soft-pulse" style={{ color: '#9a8f87' }}>kaydediliyor…</span>}
            </div>

            {rating != null && (
              <div className="flex flex-col gap-1 slide-down">
                <textarea
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onBlur={handleCommentBlur}
                  placeholder="yorumun… (isteğe bağlı)"
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none resize-none transition-all"
                  style={{
                    background: '#faf9f6',
                    border: '1.5px solid #e0d6cc',
                    color: '#1e1916',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                />
                {savingComment && (
                  <span className="text-[10px] self-end soft-pulse" style={{ color: '#9a8f87' }}>
                    kaydediliyor…
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {hasSubEvents && !isFuture && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="self-start text-xs font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95"
            style={{ background: '#f2efe9', color: '#1e1916' }}>
            {expanded ? '↑ kapat' : '↓ detayları gör'}
          </button>
        )}

        {expanded && hasSubEvents && (
          <div className="flex flex-col gap-2 slide-down border-t pt-4" style={{ borderColor: '#e5e0d8' }}>
            {loadingSubs && (
              <p className="text-xs text-center py-4 soft-pulse" style={{ color: '#9a8f87' }}>yükleniyor…</p>
            )}
            {!loadingSubs && subEvents.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: '#c4bdb5' }}>alt etkinlik bulunamadı</p>
            )}
            {subEvents.map(sub => (
              <SubEventCard key={sub.id} sub={sub} eventId={event.id} onRated={handleSubRated} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
