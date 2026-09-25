// ---------------------------------------------------------------------------
// RadioHuasteca · Elemento <audio> del boletín (HU-03)
//
// Vive en la raíz de la aplicación a propósito: así el audio NO se corta
// cuando la persona navega a otra vista y vuelve a Inicio (HU-02 / CA-02n.4).
//
// `preload="metadata"` evita descargar el archivo completo al abrir la página,
// algo indispensable con conexión lenta. Los dos <source> permiten al
// navegador elegir Opus (ligero) o MP3 (respaldo para Safari/iOS).
// ---------------------------------------------------------------------------

export function BulletinAudio({ audioRef, onError, sources }) {
  return (
    <audio
      ref={audioRef}
      data-testid="bulletin-audio"
      preload="metadata"
      onError={onError}
    >
      {sources.map(({ id, src, type }) => (
        <source key={id} src={src} type={type} onError={onError} />
      ))}
      Tu navegador no puede reproducir el boletín de audio.
    </audio>
  )
}
