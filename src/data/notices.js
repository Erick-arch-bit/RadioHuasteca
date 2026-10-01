import { audioSources } from './bulletin'

export const noticeSeeds = [
  {
    id: 'notice-water-01',
    title: 'Suspensión temporal del servicio de agua',
    description: 'El servicio se restablecerá al terminar los trabajos de mantenimiento.',
    priority: 'urgent',
    type: 'water',
    date: '2026-09-30',
    status: 'active',
    audio: audioSources,
  },
  {
    id: 'notice-health-01',
    title: 'Jornada de vacunación en la comunidad',
    description: 'Acude al centro comunitario con tu cartilla de salud.',
    priority: 'high',
    type: 'health',
    date: '2026-10-02',
    status: 'scheduled',
  },
  {
    id: 'notice-community-01',
    title: 'Reunión de asamblea comunitaria',
    description: 'La reunión mensual se realizará en la explanada.',
    priority: 'normal',
    type: 'community',
    date: '2026-09-28',
    status: 'resolved',
  },
]

export const capsuleItems = [
  {
    id: 'capsule-summary',
    title: 'Resumen comunitario · muestra Opus',
    category: 'Comunidad',
    language: 'Español',
    duration: '01:00',
    size: '160 KB',
    src: audioSources,
  },
  {
    id: 'capsule-bulletin-mp3',
    title: 'Resumen comunitario · muestra MP3',
    category: 'Información',
    language: 'Español',
    duration: '01:00',
    size: '360 KB',
    src: [audioSources[1]],
  },
]
