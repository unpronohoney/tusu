import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import DualRating from './DualRating'

export default function SubEventCard({ sub, eventId }) {
  async function save(fields) {
    await updateDoc(doc(db, 'events', eventId, 'subEvents', sub.id), fields)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl p-4 border"
      style={{ background: '#fbfaf6', borderColor: '#e8dfd7' }}>

      <p className="text-sm font-semibold" style={{ color: '#1e1916' }}>
        {sub.title}
      </p>

      <DualRating data={sub} onSave={save} size="sm" />
    </div>
  )
}
