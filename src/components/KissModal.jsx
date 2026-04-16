import { useEffect, useState } from 'react'

const EMOJIS = ['💋', '❤️', '💕', '💗', '💖', '😽', '🥰', '💝', '💘']
const MESSAGES = [
  'muah muah muah',
  'öptüm öptüm',
  'ya benimsin ya kara topraan',
  'yavrummm',
  'öpücük yağmuru ☔',
  'muuaahh',
]

export default function KissModal({ onClose }) {
  const [kisses, setKisses] = useState([])
  const [msgIdx, setMsgIdx] = useState(0)

  // Spawn floating kisses
  useEffect(() => {
    const id = setInterval(() => {
      setKisses(prev => [
        ...prev.slice(-24),
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          size: 22 + Math.random() * 34,
          duration: 3.5 + Math.random() * 2.5,
          drift: (Math.random() - 0.5) * 200,
        },
      ])
    }, 220)
    return () => clearInterval(id)
  }, [])

  // Cycle messages
  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  // Esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden cursor-pointer"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(217,119,102,0.55), rgba(30,10,15,0.85))',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      {/* Floating kisses */}
      {kisses.map(k => (
        <span
          key={k.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${k.left}%`,
            bottom: '-60px',
            fontSize: `${k.size}px`,
            ['--drift']: `${k.drift}px`,
            animation: `rise ${k.duration}s linear forwards`,
          }}
        >
          {k.emoji}
        </span>
      ))}

      {/* Center pulsing cat */}
      <div className="relative flex flex-col items-center gap-4 pointer-events-none select-none">
        <div style={{ fontSize: 'clamp(110px, 30vw, 180px)', animation: 'kissPulse 0.7s ease-in-out infinite', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}>
          😽
        </div>

        <p className="text-2xl sm:text-3xl font-bold text-white text-center px-4"
          style={{ animation: 'textBounce 0.9s ease infinite', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
          {MESSAGES[msgIdx]}
        </p>

        <p className="text-sm font-light" style={{ color: '#ffe4e1' }}>
          (dokun, kapanır)
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-all active:scale-90 hover:scale-110"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        aria-label="kapat"
      >
        ✕
      </button>

      <style>{`
        @keyframes rise {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translate(var(--drift, 0), -110vh) rotate(540deg); opacity: 0; }
        }
        @keyframes kissPulse {
          0%, 100% { transform: scale(1) rotate(-6deg); }
          50%      { transform: scale(1.18) rotate(6deg); }
        }
        @keyframes textBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-8px) scale(1.05); }
        }
      `}</style>
    </div>
  )
}
