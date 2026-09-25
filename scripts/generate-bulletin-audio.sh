#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# RadioHuasteca · Sprint 1 · HU-03
# Genera el audio de prueba del "último boletín" a partir de una narración en
# español sintetizada localmente. No descarga nada de internet.
#
# Salidas (versionadas en el repositorio):
#   public/audio/boletin-demo.opus  (preferido, más ligero para baja conectividad)
#   public/audio/boletin-demo.mp3   (respaldo para Safari / iOS)
#
# Uso:
#   bash scripts/generate-bulletin-audio.sh
#
# Requisitos: espeak-ng y ffmpeg (con libopus y libmp3lame).
# Cuando la comunidad entregue el boletín real, sustituye los dos archivos por
# el audio definitivo (y ajusta src/data/bulletin.js si cambia el nombre).
# ---------------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${REPO_ROOT}/public/audio"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "${WORK_DIR}"' EXIT

for bin in espeak-ng ffmpeg ffprobe; do
  if ! command -v "${bin}" >/dev/null 2>&1; then
    echo "ERROR: falta '${bin}'. Instálalo antes de regenerar el audio." >&2
    exit 1
  fi
done

# Texto del boletín de prueba. Deja claro que es una demostración del Sprint 1.
read -r -d '' SCRIPT_TEXT <<'TXT' || true
Buenos días, comunidad de Santa Ana Hueytlalpan.
Le habla Radio Huasteca, la voz de aquí.
Este es el boletín de prueba del primer sprint.
El audio que escucha es una demostración creada para comprobar el reproductor: se reproduce desde el propio proyecto, sin depender de internet.
Hoy compartimos tres puntos.
Primero: la radio ya tiene su página de inicio, pensada para verse bien en celulares de gama baja y con conexión lenta.
Segundo: el menú inferior permite llegar a los avisos, a los trámites y a la información de la radio con un solo toque.
Tercero: los textos principales ya están en español y el espacio para el hñähñu está preparado, pendiente de revisión con hablantes de la comunidad.
Gracias por escuchar.
Pronto, la palabra de nuestra gente.
TXT

echo "→ Sintetizando narración en español (espeak-ng)…"
espeak-ng -v es-419 -s 140 -p 46 -a 175 -w "${WORK_DIR}/boletin.wav" "${SCRIPT_TEXT}"

# Cadena de audio: quita ruido de baja frecuencia, suaviza agudos digitales,
# comprime y normaliza a -16 LUFS (estándar de voz para web móvil).
FILTERS="highpass=f=70,lowpass=f=7500,acompressor=threshold=-18dB:ratio=3:attack=8:release=180,loudnorm=I=-16:TP=-1.5:LRA=11"

mkdir -p "${OUT_DIR}"

echo "→ Codificando Opus (preferido, 16 kHz mono)…"
ffmpeg -y -hide_banner -loglevel error -i "${WORK_DIR}/boletin.wav" \
  -af "${FILTERS}" -ar 16000 -ac 1 -c:a libopus -b:a 24k -vbr on -application voip \
  "${OUT_DIR}/boletin-demo.opus"

echo "→ Codificando MP3 (respaldo, 22.05 kHz mono)…"
ffmpeg -y -hide_banner -loglevel error -i "${WORK_DIR}/boletin.wav" \
  -af "${FILTERS}" -ar 22050 -ac 1 -c:a libmp3lame -b:a 48k \
  -metadata title="Boletín de prueba · RadioHuasteca" \
  -metadata artist="RadioHuasteca" \
  -metadata comment="Audio de demostración del Sprint 1. Sustituir por el boletín real de la comunidad." \
  "${OUT_DIR}/boletin-demo.mp3"

echo "→ Resultado:"
for file in "${OUT_DIR}/boletin-demo.opus" "${OUT_DIR}/boletin-demo.mp3"; do
  size_bytes="$(stat -c%s "${file}")"
  size_kb="$((size_bytes / 1024))"
  duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}")"
  printf '   %-45s %6s KB  %ss\n' "$(basename "${file}")" "${size_kb}" "${duration}"
  if [ "${size_bytes}" -gt 1572864 ]; then
    echo "ERROR: $(basename "${file}") supera 1.5 MB (criterio CA-03.1)." >&2
    exit 1
  fi
done
