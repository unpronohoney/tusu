import confetti from 'canvas-confetti'

function fireConfetti() {
  const colors = ['#f9c74f', '#f8961e', '#f3722c', '#c4847e', '#90be6d']
  confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 }, colors })
  setTimeout(() => confetti({ particleCount: 50, spread: 120, origin: { y: 0.5, x: 0.2 }, colors, angle: 60 }), 200)
  setTimeout(() => confetti({ particleCount: 50, spread: 120, origin: { y: 0.5, x: 0.8 }, colors, angle: 120 }), 350)
}

export default function StarRating({ value, onChange, readonly = false, hovered, onHover, size = 'md' }) {
  const display = hovered ?? value ?? 0
  const fontSize = size === 'sm' ? '1rem' : '1.15rem'

  function handleClick(star) {
    if (readonly) return
    onChange(star)
    if (star === 10) fireConfetti()
  }

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && onHover?.(star)}
          onMouseLeave={() => !readonly && onHover?.(null)}
          className="star-btn leading-none"
          style={{ fontSize, cursor: readonly ? 'default' : 'pointer', background: 'none', border: 'none', padding: '1px' }}
          aria-label={`${star} yıldız`}
        >
          <span style={{ color: star <= display ? '#f59e0b' : '#d4cfc8' }}>
            {star <= display ? '★' : '★'}
          </span>
        </button>
      ))}

      {value != null && (
        <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: '#fef3c7', color: '#92400e' }}>
          {value}/10
        </span>
      )}
    </div>
  )
}
