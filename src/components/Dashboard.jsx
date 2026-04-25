import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import EventCard from './EventCard'
import WishBox from './WishBox'
import KissModal from './KissModal'
import CreateEventModal from './CreateEventModal'

function getDate(e) {
  if (!e.date) return new Date(0)
  return e.date.toDate ? e.date.toDate() : new Date(e.date)
}

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [kissOpen, setKissOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'desc'))
    const unsub = onSnapshot(q,
      snap => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => {
        console.error(err)
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // Group by year (already sorted ascending from Firestore)
  const byYear = events.reduce((acc, e) => {
    const yr = getDate(e).getFullYear()
    if (!acc[yr]) acc[yr] = []
    acc[yr].push(e)
    return acc
  }, {})

  return (
    <div className="min-h-screen" style={{ background: '#f2efe9' }}>

      <header className="sticky top-0 z-10 border-b" style={{ background: '#f2efe9cc', backdropFilter: 'blur(10px)', borderColor: '#e5e0d8' }}>
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: '#1e1916' }}>
              anılarımız
            </h1>
            <p className="text-xs font-light mt-0.5" style={{ color: '#9a8f87' }}>
              her an seninle güzel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateOpen(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all active:scale-95 hover:scale-105"
              style={{ background: '#ffffff', color: '#1e1916', border: '1.5px solid #1e1916' }}>
              ＋ anı
            </button>
            <button
              onClick={() => setKissOpen(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all active:scale-95 hover:scale-105"
              style={{ background: '#1e1916', color: '#f2efe9' }}>
              tuanna ♡
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">

        {loading && (
          <div className="flex flex-col items-center py-24 gap-3">
            <div className="w-10 h-10 rounded-full soft-pulse" style={{ background: '#e5e0d8' }} />
            <p className="text-sm soft-pulse" style={{ color: '#9a8f87' }}>yükleniyor…</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-4 text-sm text-center"
            style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
            <p className="font-medium">Bağlantı hatası</p>
            <p className="text-xs mt-1 opacity-70">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-2 text-center">
            <p className="text-base font-medium" style={{ color: '#1e1916' }}>henüz anı eklenmemiş</p>
            <p className="text-sm" style={{ color: '#9a8f87' }}>Firebase'e ilk etkinliği ekle!</p>
          </div>
        )}

        {/* Timeline */}
        {!loading && !error && Object.entries(byYear).map(([year, evts]) => (
          <div key={year} className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-semibold px-3 py-1 rounded-full"
                style={{ background: '#d97766', color: '#ffffff' }}>{year}</span>
              <div className="flex-1 h-px" style={{ background: '#ddd8d0' }} />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: '#ddd8d0' }} />
              <div className="flex flex-col gap-6">
                {evts.map(event => (
                  <div key={event.id} className="timeline-item relative pl-10">
                    <div className="timeline-dot absolute top-5 w-[14px] h-[14px] rounded-full border-2 z-10"
                      style={{
                        background: '#ffffff',
                        borderColor: getDate(event) > new Date() ? '#6fa86f' : '#d97766',
                        left: '16px',
                        transform: 'translateX(-50%)',
                      }} />
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4">
          <WishBox />
        </div>

        <p className="text-center text-xs mt-8 pb-4" style={{ color: '#c4bdb5' }}>
          made with love 🩶
        </p>
      </main>

      {kissOpen && <KissModal onClose={() => setKissOpen(false)} />}
      {createOpen && <CreateEventModal onClose={() => setCreateOpen(false)} />}
    </div>
  )
}
