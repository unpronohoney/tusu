import { useState, useRef } from 'react'
import StarRating from './StarRating'

function RatingRow({ label, labelColor, rating, comment, onRate, onCommentChange, onCommentBlur, savingRating, savingComment, size }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: labelColor }}>
        {label}
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        <StarRating value={rating} onChange={onRate} hovered={hovered} onHover={setHovered} size={size} />
        {savingRating && <span className="text-xs soft-pulse" style={{ color: '#9a8f87' }}>kaydediliyor…</span>}
      </div>
      {rating != null && (
        <div className="flex flex-col gap-1 slide-down">
          <textarea
            rows={2}
            value={comment}
            onChange={e => onCommentChange(e.target.value)}
            onBlur={onCommentBlur}
            placeholder="yorumun… (isteğe bağlı)"
            className="w-full rounded-xl px-3 py-2 text-xs outline-none resize-none transition-all"
            style={{ background: '#faf9f6', border: '1.5px solid #e0d6cc', color: '#1e1916', fontFamily: 'Montserrat, sans-serif' }}
          />
          {savingComment && (
            <span className="text-[10px] self-end soft-pulse" style={{ color: '#9a8f87' }}>kaydediliyor…</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function DualRating({ data, onSave, size }) {
  const [rT, setRT] = useState(data.rating ?? null)
  const [cT, setCT] = useState(data.comment ?? '')
  const [rM, setRM] = useState(data.rating_mirza ?? null)
  const [cM, setCM] = useState(data.comment_mirza ?? '')
  const [sav, setSav] = useState({})
  const lastT = useRef(data.comment ?? '')
  const lastM = useRef(data.comment_mirza ?? '')

  async function doRate(key, setter, star) {
    setter(star)
    setSav(s => ({ ...s, [key]: true }))
    try { await onSave({ [key]: star }) } finally { setSav(s => ({ ...s, [key]: false })) }
  }

  async function doBlur(key, val, lastRef) {
    const trimmed = val.trim()
    if (trimmed === lastRef.current) return
    setSav(s => ({ ...s, [key]: true }))
    try {
      await onSave({ [key]: trimmed })
      lastRef.current = trimmed
    } finally { setSav(s => ({ ...s, [key]: false })) }
  }

  return (
    <div className="flex flex-col gap-4">
      <RatingRow label="Tusu" labelColor="#d97766"
        rating={rT} comment={cT}
        onRate={s => doRate('rating', setRT, s)}
        onCommentChange={setCT}
        onCommentBlur={() => doBlur('comment', cT, lastT)}
        savingRating={sav.rating} savingComment={sav.comment}
        size={size} />
      <RatingRow label="Mirza" labelColor="#5b7fa3"
        rating={rM} comment={cM}
        onRate={s => doRate('rating_mirza', setRM, s)}
        onCommentChange={setCM}
        onCommentBlur={() => doBlur('comment_mirza', cM, lastM)}
        savingRating={sav.rating_mirza} savingComment={sav.comment_mirza}
        size={size} />
    </div>
  )
}
