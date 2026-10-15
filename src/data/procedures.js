// Datos de demostración del Sprint 3. Los audios se enlazan por trámite.
const baseUrl = import.meta.env?.BASE_URL ?? '/'

export const procedures = [
  {
    id: 'constancia-residencia',
    title: 'Constancia de residencia',
    summary: 'Solicitud de constancia para acreditar el domicilio en la comunidad.',
    requirements: ['Identificación oficial vigente', 'Comprobante de domicilio reciente', 'Datos de contacto'],
    steps: ['Acude a la oficina de atención comunitaria.', 'Entrega los documentos y llena la solicitud.', 'Consulta la fecha indicada para recoger la constancia.'],
    responsible: 'Oficina de atención comunitaria · dato demostrativo, confirmar con la autoridad local.',
    validity: 'La vigencia depende de la institución que solicita la constancia.',
    priority: true,
    audio: { src: `${baseUrl}audio/tramite-constancia-residencia.mp3`, language: 'Español', voice: 'Lizy · Customer Service Assistant', demo: false },
    hnhStatus: 'Pendiente de traducción y validación comunitaria',
  },
  {
    id: 'apoyo-adulto-mayor',
    title: 'Orientación para apoyos a personas adultas mayores',
    summary: 'Información inicial para solicitar orientación sobre programas de apoyo.',
    requirements: ['Identificación oficial', 'CURP', 'Comprobante de domicilio'],
    steps: ['Verifica la convocatoria y fechas vigentes.', 'Acude al módulo oficial que corresponda.', 'Solicita una revisión de documentos antes de entregarlos.'],
    responsible: 'Módulo oficial del programa · confirmar ubicación y convocatoria vigente.',
    validity: 'La convocatoria y sus fechas pueden cambiar.',
    priority: true,
    audio: { src: `${baseUrl}audio/tramite-apoyo-adulto-mayor.mp3`, language: 'Español', voice: 'Ninoska · Spanish Teacher', demo: false },
    hnhStatus: 'Pendiente de traducción y validación comunitaria',
  },
  {
    id: 'registro-aviso-comunitario',
    title: 'Registro de aviso comunitario',
    summary: 'Canal para compartir un aviso de interés para la comunidad.',
    requirements: ['Título y descripción del aviso', 'Fecha y tipo de aviso', 'Medio de contacto'],
    steps: ['Prepara la información clara y verificable.', 'Entrega el aviso a la persona responsable de comunicación.', 'Confirma su publicación.'],
    responsible: 'Equipo de comunicación comunitaria · referencia de demostración.',
    validity: null,
    priority: false,
    audio: null,
    hnhStatus: 'Pendiente de traducción y validación comunitaria',
  },
]
