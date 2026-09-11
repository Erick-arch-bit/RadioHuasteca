export const sections = ['Inicio', 'En vivo', 'Trámites', 'Programas', 'Noticias', 'Eventos', 'Participa']

export const navItems = [
  { id: 'Inicio', label: 'Inicio', icon: '⌂' },
  { id: 'En vivo', label: 'En vivo', icon: '◉' },
  { id: 'Trámites', label: 'Trámites', icon: '📋' },
  { id: 'Programas', label: 'Programas', icon: '🎙️' },
  { id: 'Noticias', label: 'Noticias', icon: '📰' },
  { id: 'Eventos', label: 'Eventos', icon: '📅' },
  { id: 'Participa', label: 'Participa', icon: '💬' },
]

export const universityInfo = {
  name: 'Radio Universitaria',
  frequency: 'Universidad',
  tagline: 'La voz de nuestra comunidad',
  description: 'Medio de comunicación comunitario para la difusión de información académica, administrativa y cultural de la universidad.',
}

export const tramites = [
  {
    icon: '📑',
    title: 'Constancia',
    steps: ['Solicitar en línea', 'Adjuntar documentación requerida', 'Esperar confirmación por correo', 'Recoger en oficinas'],
    requisitos: ['Identificación oficial', 'Solicitud debidamente llenada', 'Comprobante de pago (en su caso)'],
    contacto: 'Departamento de Servicios Escolares',
    tiempo: '5-7 días hábiles',
  },
  {
    icon: '🎓',
    title: 'Titulación',
    steps: ['Verificar requisitos de titulación', 'Solicitar cédula profesional', 'Presentar proyecto de titulación', 'Defender ante jurado', 'Recibir constancia'],
    requisitos: ['Promedio mínimo', 'Anteproyecto aprobado', 'Servicio social completado', 'Carta de intención'],
    contacto: 'Coordinación de Titulación',
    tiempo: '30-60 días hábiles',
  },
  {
    icon: '🏢',
    title: 'Servicio Social',
    steps: ['Buscar opción de servicio social', 'Solicitar carta de liberación', 'Cumplir horas requeridas', 'Entregar reporte final', 'Obtener constancia'],
    requisitos: ['Estatus regular en la universidad', 'Carta de aceptación de la institución receptora', 'Identificación oficial'],
    contacto: 'Coordinación de Servicio Social',
    tiempo: 'Mínimo 480 horas',
  },
  {
    icon: '💼',
    title: 'Prácticas Profesionales',
    steps: ['Registrar empresa receptora', 'Firmar convenio', 'Iniciar prácticas', 'Reportar avance mensual', 'Entregar informe final'],
    requisitos: ['Carta de aceptación', 'Convenio de prácticas', 'Plan de trabajo'],
    contacto: 'Departamento de Vinculación',
    tiempo: 'Variable según convenio',
  },
  {
    icon: '💰',
    title: 'Becas',
    steps: ['Revisar convocatoria vigente', 'Llenar solicitud en línea', 'Adjuntar documentos de apoyo', 'Esperar resultado', 'Confirmar inscripción'],
    requisitos: ['Promedio mínimo', 'Carta de motivación', 'Constancia de estudios', 'Comprobante de ingresos (según tipo)'],
    contacto: 'Departamento de Becas',
    tiempo: 'Depende de la convocatoria',
  },
  {
    icon: '📝',
    title: 'Reinscripción',
    steps: ['Revisar fechas de reinscripción', 'Realizar pago correspondiente', 'Verificar documentos pendientes', 'Confirmar reinscripción'],
    requisitos: ['Promedio mínimo', 'Pago de reinscripción', 'Identificación oficial'],
    contacto: 'Departamento de Servicios Escolares',
    tiempo: 'Inmediato (en línea)',
  },
  {
    icon: '🪪',
    title: 'Credencial',
    steps: ['Solicitar credencial en línea', 'Subir fotografía', 'Pagar derechos', 'Recoger credencial'],
    requisitos: ['Fotografía reciente', ['Identificación oficial', 'Pago de derechos']],
    contacto: 'Departamento de Credenciales',
    tiempo: '10 días hábiles',
  },
  {
    icon: '📚',
    title: 'Inscripción',
    steps: ['Reviar fecha de inscripción', 'Completar formulario de inscripción', 'Pagar colegiatura', 'Entregar documentación', 'Recibir confirmación'],
    requisitos: ['Acta de nacimiento', ['Identificación oficial', 'Comprobante de estudios', 'Certificado de secundaria/preparatoria']],
    contacto: 'Departamento de Servicios Escolares',
    tiempo: 'Inscripciones abiertas en fechas establecidas',
  },
]

export const programas = [
  { time: '08:00', name: 'Buenos días, Universidad', host: 'Equipo de Comunicación', description: 'Boletín matutino con los avisos más importantes del día.', live: true, category: 'Informativo' },
  { time: '10:00', name: 'Trámites Express', host: 'Departamento de Servicios Escolares', description: 'Guía rápida para realizar trámites universitarios.', live: false, category: 'Educativo' },
  { time: '12:00', name: 'Voces de la Universidad', host: 'Estudiantes diversos', description: 'Historias, opiniones y experiencias de la comunidad universitaria.', live: false, category: 'Cultural' },
  { time: '14:00', name: 'Agenda Académica', host: 'Coordinación Académica', description: 'Información sobre actividades, cambios de horario y eventos.', live: false, category: 'Informativo' },
  { time: '16:00', name: 'Cultura en Vivo', host: 'Coordinación Cultural', description: 'Música, arte, tradiciones y expresiones de nuestra comunidad.', live: false, category: 'Cultural' },
  { time: '18:00', name: 'Cierre Universitario', host: 'Equipo de Comunicación', description: 'Resumen del día, próximas actividades y llamados de atención.', live: false, category: 'Informativo' },
]

export const noticias = [
  { author: 'Coordinación de Comunicación', time: 'Hace 2 h', category: 'Aviso', title: 'Cambio de horario en aulas del edificio C', text: 'A partir del lunes 15 de septiembre, las clases del edificio C tendrán horario de 8:00 a 14:00 horas. Verifica tus horarios en el portal.', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=900&q=80', color: 'coral' },
  { author: 'Departamento de Becas', time: 'Hace 5 h', category: 'Becas', title: 'Convocatoria abierta para becas de apoyo estudiantil', text: 'Se abre la convocatoria para becas de apoyo económico dirigidas a estudiantes con alto rendimiento académico. Cierra el 30 de septiembre.', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80', color: 'yellow' },
  { author: 'Alumno: Carlos R.', time: 'Hace 1 día', category: 'Comunidad', title: 'Feria de talentos estudiantil este viernes', text: 'La comunidad estudiantil presentará sus proyectos creativos y emprendedores. ¡No te lo pierdas! Habrá actividades, música y premiación.', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80', color: 'green' },
  { author: 'Coordinación de Titulación', time: 'Hace 2 días', category: 'Titulación', title: 'Juntas de titulación para egresados de agosto', text: 'Se convocan a los egresados de agosto a sus juntas de titulación. Revisa tu correo institucional para agendar cita.', image: 'https://images.unsplash.com/photo-1543269664-7b8989b74092?auto=format&fit=crop&w=900&q=80', color: 'yellow' },
]

export const eventos = [
  { title: 'Ferias de Servicio Social', date: '15 sep, 10:00', location: 'Auditorio Principal', description: 'Instituciones presentan sus programas de servicio social.', color: 'coral' },
  { title: 'Conferencia: Habilidades de Comunicación', date: '18 sep, 16:00', location: 'Aula Magna', description: 'Taller práctico sobre comunicación efectiva para estudiantes.', color: 'green' },
  { title: 'Torneo de Fútbol Interfacultades', date: '22 sep, 09:00', location: 'Cancha Central', description: 'Competencia deportiva entre facultades de la universidad.', color: 'yellow' },
  { title: 'Exposición de Arte Estudiantil', date: '25 sep, 10:00', location: 'Galería Universitaria', description: 'Muestra de obras de pintura, fotografía y escultura.', color: 'green' },
  { title: 'Seminario de Titulación 2025', date: '28 sep, 14:00', location: 'Biblioteca', description: 'Sesión informativa sobre proceso de titulación y requisitos.', color: 'coral' },
]

export const shows = [
  { time: '08:00', name: 'Buenos días, Universidad', host: 'Equipo de Comunicación', live: true },
  { time: '10:00', name: 'Trámites Express', host: 'Departamento de Servicios Escolares' },
  { time: '12:00', name: 'Voces de la Universidad', host: 'Estudiantes diversos' },
]

export const participationOptions = [
  { id: 'noticia', icon: '📰', title: 'Enviar noticia', description: 'Comparte una noticia relevante para la comunidad universitaria.' },
  { id: 'programa', icon: '🎙️', title: 'Proponer programa', description: 'Sugerencia para un nuevo programa de radio universitaria.' },
  { id: 'reporte', icon: '📢', title: 'Reportar información', description: 'Reporta información que necesite aclaración o difusión urgente.' },
  { id: 'opinion', icon: '💬', title: 'Enviar opinión', description: 'Tu opinión importa. Comparte tu perspectiva sobre temas universitarios.' },
  { id: 'evento', icon: '📅', title: 'Compartir evento', description: 'Propone un evento que quieras que se difunda en la radio.' },
]

export const postData = [
  { author: 'Coordinación de Comunicación', time: 'Hace 2 h', category: 'Aviso', title: 'Cambio de horario en aulas del edificio C', text: 'A partir del lunes 15 de septiembre, las clases del edificio C tendrán horario de 8:00 a 14:00 horas. Verifica tus horarios en el portal institucional.', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=900&q=80', color: 'coral' },
  { author: 'Estudiantes', time: 'Hace 1 día', category: 'Podcasts', title: 'Voces de la Facultad de Derecho', text: 'Entrevista con egresados sobre su experiencia en el servicio social y el proceso de titulación.', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80', color: 'yellow' },
  { author: 'Departamento de Cultura', time: 'Hace 3 días', category: 'Noticias', title: 'Feria de talento artístico estudiantil', text: 'Se presentarán obras de pintura, música y teatro de estudiantes de todas las facultades. ¡Los esperamos!', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80', color: 'green' },
]

export const filters = ['Todo', 'Aviso', 'Becas', 'Comunidad', 'Titulación', 'Podcasts']
