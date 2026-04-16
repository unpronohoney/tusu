import { useState, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import StarRating from './StarRating'

export default function SubEventCard({ sub, eventId, onRated }) {
  const [rating, setRating] = useState(sub.rating ?? null)
  const [comment, setComment] = useState(sub.comment ?? '')
  const [hovered, setHovered] = useState(null)
  const [savingRating, setSavingRating] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const lastSavedComment = useRef(sub.comment ?? '')

  async function persist(fields) {
    await updateDoc(doc(db, 'events', eventId, 'subEvents', sub.id), fields)
  }

  async function handleRate(star) {
    setRating(star)
    setSavingRating(true)
    try {
      await persist({ rating: star })
      onRated(sub.id, star, comment)
    } finally {
      setSavingRating(false)
    }
  }

  async function handleCommentBlur() {
    const trimmed = comment.trim()
    if (trimmed === lastSavedComment.current) return
    setSavingComment(true)
    try {
      await persist({ comment: trimmed })
      lastSavedComment.current = trimmed
      onRated(sub.id, rating, trimmed)
    } finally {
      setSavingComment(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl p-4 border"
      style={{ background: '#fbfaf6', borderColor: '#e8dfd7' }}>

      <p className="text-sm font-semibold" style={{ color: '#1e1916' }}>
        {sub.title}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <StarRating
          value={rating}
          onChange={handleRate}
          hovered={hovered}
          onHover={setHovered}
          size="sm"
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
              background: '#ffffff',
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
  )
}
