import { useEffect, useRef, useState } from 'react'

export function PostModal({ post, onClose, isSubscribed, onToggleSubscription }) {
  const [liked, setLiked] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([
    'Me encanta que compartan estas historias del barrio.',
    'Gracias por mantenernos informados.',
  ])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)
  const isPodcast = post.category === 'Podcasts'

  useEffect(() => {
    const audio = audioRef.current
    return () => audio?.pause()
  }, [])

  const toggleAudio = async () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      await audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const updateProgress = () => {
    const audio = audioRef.current
    if (audio) setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
  }

  const seekAudio = (event) => {
    const audio = audioRef.current
    if (audio?.duration) audio.currentTime = (Number(event.target.value) / 100) * audio.duration
    setProgress(Number(event.target.value))
  }

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

  const addComment = (event) => {
    event.preventDefault()
    if (!comment.trim()) return
    setComments((current) => [...current, comment.trim()])
    setComment('')
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <article className="post-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar publicación">×</button>
      <div className={`modal-cover ${post.color}`} style={{ backgroundImage: `url(${post.image})` }}>
        <span>{post.category}</span>
        {isPodcast && <><button className="modal-play" type="button" onClick={toggleAudio} aria-label={isPlaying ? 'Pausar podcast' : 'Reproducir podcast'}>{isPlaying ? 'Ⅱ' : '▶'}</button><audio ref={audioRef} preload="metadata" src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={updateProgress} onEnded={() => { setIsPlaying(false); setProgress(0) }}>Tu navegador no soporta audio.</audio><div className="podcast-progress"><span>{formatTime((progress / 100) * duration)}</span><input type="range" min="0" max="100" step="0.1" value={progress} onChange={seekAudio} aria-label="Progreso del podcast" /><span>{formatTime(duration)}</span></div></>}
      </div>
      <div className="modal-body">
        <div className="post-meta">
          <span className="mini-avatar">{post.author.charAt(0)}</span>
          <span><strong>{post.author}</strong><small>{post.time} · Comunidad</small></span>
          <button className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`} type="button" onClick={() => onToggleSubscription(post.author)}>{isSubscribed ? 'Suscrito' : 'Suscribirse'}</button>
        </div>
        <h2 id="modal-title">{post.title}</h2>
        <p className="modal-text">{post.text}</p>
        <div className="modal-actions"><button className={liked ? 'liked' : ''} type="button" onClick={() => setLiked((current) => !current)}>♥ {liked ? 25 : 24}</button><span>◌ {comments.length + 6} comentarios</span><button type="button">↗ Compartir</button></div>
        <div className="comments"><p className="kicker">COMENTARIOS</p>{comments.map((item, index) => <p className="comment" key={`${item}-${index}`}><span>{index === comments.length - 1 && comments.length > 2 ? 'Tú' : index ? 'Carlos R.' : 'Luz M.'}</span>{item}</p>)}</div>
        <form className="comment-form" onSubmit={addComment}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Escribe un comentario..." aria-label="Comentario" /><button type="submit" aria-label="Enviar comentario">↗</button></form>
      </div>
    </article>
  </div>
}
