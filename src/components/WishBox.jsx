import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export default function WishBox() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState(null)

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
    </section>
  )
}
