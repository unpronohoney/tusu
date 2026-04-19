import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

function formatWhen(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function WishBox() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState(null)
  const [wishes, setWishes] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setWishes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, err => console.error('wishes load failed', err))
    return unsub
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setStatus('saving')
    try {
      await addDoc(collection(db, 'wishes'), {
        text: text.trim(),
        createdAt: serverTimestamp(),
      })
      setText('')
      setStatus('done')
      setTimeout(() => setStatus(null), 3000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="rounded-2xl p-5 flex flex-col gap-4 border"
      style={{ background: '#ffffff', borderColor: '#e5e0d8' }}>

      <div>
        <h3 className="text-base font-semibold" style={{ color: '#1e1916' }}>
          istek kutusu
        </h3>
        <p className="text-xs mt-0.5" style={{ color: '#9a8f87' }}>
          "şunu da yapalım" dedikleriniz, madam:
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          rows={3}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="beraber olsun…"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
          style={{
            background: '#f2efe9',
            border: '1.5px solid #ddd8d0',
            color: '#1e1916',
            fontFamily: 'Montserrat, sans-serif',
          }}
        />

        <button
          type="submit"
          disabled={status === 'saving' || !text.trim()}
          className="self-end text-xs font-medium px-5 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-40"
          style={{ background: '#1e1916', color: '#f2efe9' }}>
          {status === 'saving' ? 'gönderiliyor…' : 'gönder'}
        </button>

        {status === 'done' && (
          <p className="text-xs text-center py-2 rounded-xl slide-down"
            style={{ background: '#e8f0e8', color: '#4a6b4a' }}>
            alındı! bir gün olacak
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-center" style={{ color: '#c4847e' }}>
            bir hata oluştu, tekrar dene
          </p>
        )}
      </form>

      {wishes.length > 0 && (
        <div className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: '#e5e0d8' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9a8f87' }}>
            eklenen istekler ({wishes.length})
          </p>
          <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {wishes.map(w => {
              const done = !!w.done
              const toggle = () => updateDoc(doc(db, 'wishes', w.id), { done: !done }).catch(console.error)
              return (
                <li key={w.id}
                  className="rounded-xl px-3 py-2.5 flex items-start gap-3 transition-opacity"
                  style={{ background: done ? '#f4f2ec' : '#faf9f6', border: '1px solid #ece6dd', opacity: done ? 0.65 : 1 }}>
                  <button
                    onClick={toggle}
                    aria-label={done ? 'yapılmadı işaretle' : 'yapıldı işaretle'}
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all active:scale-90"
                    style={{
                      background: done ? '#6fa86f' : '#ffffff',
                      border: `1.5px solid ${done ? '#6fa86f' : '#c4bdb5'}`,
                      color: '#ffffff',
                      fontSize: '11px',
                    }}>
                    {done ? '✓' : ''}
                  </button>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <p className="text-sm leading-snug whitespace-pre-wrap"
                      style={{ color: '#1e1916', textDecoration: done ? 'line-through' : 'none' }}>
                      {w.text}
                    </p>
                    {w.createdAt && (
                      <span className="text-[10px] self-end" style={{ color: '#c4bdb5' }}>
                        {formatWhen(w.createdAt)}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
