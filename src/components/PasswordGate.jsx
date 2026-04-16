import { useState } from 'react'
import catImage from './cat.jpeg';

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState(false)
  const [imageShake, setImageShake] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim().toLowerCase() === 'selamya') {
      onUnlock()
    } else {
      setShake(true)
      setError(true)
      setTimeout(() => setShake(false), 500)
      setValue('')
    }
  }

  function handleImageClick() {
    setImageShake(true);
    setTimeout(() => setImageShake(false), 500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f2efe9' }}>
      <div className="w-full max-w-xs flex flex-col items-center gap-6">

        <div
          onClick={handleImageClick}
          className="cursor-pointer transition-transform active:scale-95"
          style={{
            animation: imageShake ? 'shake 0.5s ease' : undefined,
            padding: '16px',
            background: '#ffffff',
            borderRadius: '32px',
            border: '1.5px solid #ddd8d0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
        >
          <div className="w-40 h-56 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={catImage}
              alt="clickable cat meme"
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1e1916' }}>
            Merhaba
          </h1>
          <p className="text-sm mt-1 font-light" style={{ color: '#9a8f87' }}>
            bu sayfa sana özel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div style={{ animation: shake ? 'shake 0.5s ease' : undefined }}>
            <input
              type="password"
              placeholder="şifreni gir"
              value={value}
              onChange={e => { setValue(e.target.value); setError(false) }}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-center text-sm tracking-widest outline-none transition-all"
              style={{
                background: '#ffffff',
                border: `1.5px solid ${error ? '#c4847e' : '#ddd8d0'}`,
                color: '#1e1916',
                fontFamily: 'Montserrat, sans-serif',
              }}
            />
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: '#c4847e' }}>
              yanlış şifre, tekrar dene
            </p>
          )}

          <button
            type="submit"
            className="rounded-xl py-3 text-sm font-medium tracking-wide transition-all active:scale-95"
            style={{ background: '#1e1916', color: '#f2efe9' }}
          >
            giriş yap
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  )
}
