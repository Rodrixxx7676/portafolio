/**
 * Genera el CV de Francisco Ponte en formato Word.
 *
 * El diseño sigue la misma identidad del portafolio (rojo sobre negro sobre
 * blanco) para que quien reciba el PDF y luego entre al sitio reconozca que
 * son la misma persona.
 */
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, ExternalHyperlink, LevelFormat, TabStopType, convertInchesToTwip,
} = require('docx');
const fs = require('fs');

const ROJO = 'B40808';
const GRIS = '514F4F';
const NEGRO = '1A1919';

/** Título de sección con la regla roja debajo. */
const seccion = (texto) =>
  new Paragraph({
    spacing: { before: 200, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: ROJO, space: 4 } },
    children: [
      new TextRun({ text: texto.toUpperCase(), bold: true, size: 21, color: ROJO, font: 'Calibri', characterSpacing: 30 }),
    ],
  });

/** Cargo a la izquierda y fechas alineadas a la derecha, en la misma línea. */
/** Ancho útil de la página: 12240 de ancho menos los dos márgenes de 900. */
const MARGEN_DERECHO = 10440;

const puesto = (cargo, fechas) =>
  new Paragraph({
    spacing: { before: 120, after: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: MARGEN_DERECHO }],
    children: [
      new TextRun({ text: cargo, bold: true, size: 21, color: NEGRO, font: 'Calibri' }),
      new TextRun({ text: `\t${fechas}`, size: 18, color: GRIS, font: 'Calibri' }),
    ],
  });

const organizacion = (texto) =>
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: texto, size: 18, color: ROJO, font: 'Calibri', bold: true })],
  });

const vinneta = (texto) =>
  new Paragraph({
    numbering: { reference: 'lista', level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text: texto, size: 18, color: NEGRO, font: 'Calibri' })],
  });

/** Proyecto: nombre, una línea de qué hace y su stack, más el enlace. */
const proyecto = (nombre, descripcion, stack, url) => {
  const hijos = [
    new TextRun({ text: `${nombre} — `, bold: true, size: 18, color: NEGRO, font: 'Calibri' }),
    new TextRun({ text: descripcion, size: 18, color: NEGRO, font: 'Calibri' }),
    new TextRun({ text: ` · ${stack}`, size: 17, color: GRIS, font: 'Calibri', italics: true }),
  ];
  if (url) {
    hijos.push(new TextRun({ text: '  ', size: 19 }));
    hijos.push(
      new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text: url.replace(/^https?:\/\//, ''), size: 17, color: ROJO, font: 'Calibri', underline: {} })],
      }),
    );
  }
  return new Paragraph({ numbering: { reference: 'lista', level: 0 }, spacing: { after: 60 }, children: hijos });
};

const habilidad = (etiqueta, valores) =>
  new Paragraph({
    spacing: { after: 50 },
    children: [
      new TextRun({ text: `${etiqueta}:  `, bold: true, size: 18, color: NEGRO, font: 'Calibri' }),
      new TextRun({ text: valores, size: 18, color: NEGRO, font: 'Calibri' }),
    ],
  });

const doc = new Document({
  numbering: {
    config: [{
      reference: 'lista',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '•',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.22), hanging: convertInchesToTwip(0.16) } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 620, right: 900, bottom: 520, left: 900 },
      },
    },
    children: [
      // --- Encabezado ---
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: 'FRANCISCO PONTE', bold: true, size: 44, color: NEGRO, font: 'Calibri', characterSpacing: 40 })],
      }),
      new Paragraph({
        spacing: { after: 90 },
        children: [new TextRun({ text: 'Estudiante de Ingeniería Empresarial y de Sistemas  ·  Desarrollador .NET', size: 21, color: ROJO, font: 'Calibri' })],
      }),
      new Paragraph({
        spacing: { after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D9D9D9', space: 6 } },
        children: [
          new TextRun({ text: 'Perú  ·  +51 949 238 917  ·  ', size: 18, color: GRIS, font: 'Calibri' }),
          new ExternalHyperlink({ link: 'mailto:rodripontevillarroel@gmail.com', children: [new TextRun({ text: 'rodripontevillarroel@gmail.com', size: 18, color: ROJO, font: 'Calibri', underline: {} })] }),
          new TextRun({ text: '  ·  ', size: 18, color: GRIS, font: 'Calibri' }),
          new ExternalHyperlink({ link: 'https://www.linkedin.com/in/rodrigo-ponte-baa1a7253/', children: [new TextRun({ text: 'LinkedIn', size: 18, color: ROJO, font: 'Calibri', underline: {} })] }),
          new TextRun({ text: '  ·  ', size: 18, color: GRIS, font: 'Calibri' }),
          new ExternalHyperlink({ link: 'https://github.com/Rodrixxx7676', children: [new TextRun({ text: 'github.com/Rodrixxx7676', size: 18, color: ROJO, font: 'Calibri', underline: {} })] }),
        ],
      }),

      seccion('Perfil'),
      new Paragraph({
        spacing: { after: 60 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({
          text: 'Estudiante de Ingeniería Empresarial y de Sistemas con experiencia en soporte de infraestructura TI y desarrollo sobre el ecosistema .NET. Automatizo procesos internos, integro APIs de terceros con bases de datos corporativas y construyo aplicaciones web completas, del modelo de datos a la interfaz. Me mueven la arquitectura de software y los sistemas que se pueden mantener sin sufrir.',
          size: 18, color: NEGRO, font: 'Calibri',
        })],
      }),

      seccion('Experiencia profesional'),
      puesto('Auxiliar de Sistemas', 'Marzo 2026 — Actualidad'),
      organizacion('Grupo Carso'),
      vinneta('Resuelvo más de 80 incidencias tecnológicas al mes, desde fallos de infraestructura hasta configuraciones críticas de red, sosteniendo la continuidad operativa del área de sistemas.'),
      vinneta('Desarrollo scripts de automatización interna que optimizan la sincronización de herramientas corporativas y reducen trabajo manual repetitivo del equipo.'),
      vinneta('Ejecuto el monitoreo y el mantenimiento preventivo de las estaciones de trabajo, gestionando sus configuraciones críticas.'),
      vinneta('Construí Ward, el sistema interno de gestión de garantías que integra la API de Dell con la base de datos de la empresa.'),

      puesto('Auxiliar Operativo', 'Octubre 2025 — Febrero 2026'),
      organizacion('Grupo Carso'),
      vinneta('Elaboré reportes de rendimiento operativo y di soporte a la supervisión técnica del área con el ecosistema de Office 365.'),
      vinneta('Participé en el modelado de los flujos de trabajo iniciales para optimizar los recursos logísticos del área.'),

      seccion('Proyectos'),
      proyecto('Clack', 'reloj mundial con hora, temperatura, alarmas y planificador de reuniones entre husos horarios.', 'React · Node.js · MVVM · PWA', 'https://github.com/Rodrixxx7676/Clack'),
      proyecto('Ward', 'sistema de gestión de garantías de equipos de cómputo, integrando la API de Dell con la base de datos corporativa.', 'JavaScript · API REST', ''),
      proyecto('KURS', 'web corporativa en producción para una empresa de automatización y desarrollo.', 'Node.js · Express · PostgreSQL', 'https://kurs-seenode.seenode.app'),
      proyecto('Sedix', 'aplicación de metas de ahorro personal con seguimiento de progreso.', 'Flutter · ASP.NET Core 8 · PostgreSQL', 'https://github.com/Rodrixxx7676/sedix'),
      proyecto('VortexFit', 'sistema de gestión de gimnasios: socios, membresías y rutinas.', 'ASP.NET Core MVC · Oracle 23ai', 'https://github.com/Rodrixxx7676/vortexfit'),
      proyecto('Sistema de recomendación', 'buscador de la biblioteca virtual universitaria con aprendizaje automático, para aumentar su uso.', 'Machine Learning · Proyecto universitario', ''),

      seccion('Formación'),
      puesto('Ingeniería Empresarial y de Sistemas', '2023 — Actualidad'),
      organizacion('Universidad Científica del Sur'),
      puesto('Certificación ITIL V4', '2026'),
      organizacion('EDUCBA'),

      seccion('Competencias técnicas'),
      habilidad('Lenguajes', 'C#, JavaScript, TypeScript, Dart, SQL, HTML y CSS'),
      habilidad('Frameworks', '.NET / ASP.NET Core, Blazor, React, Node.js con Express, Flutter'),
      habilidad('Bases de datos', 'PostgreSQL, Oracle 23ai, modelado de datos relacional'),
      habilidad('Herramientas', 'Git y GitHub, n8n, Docker, AWS Elastic Beanstalk, Office 365'),
      habilidad('Prácticas', 'Arquitectura MVVM y MVC, programación orientada a objetos, ITIL V4'),
      habilidad('Idiomas', 'Español nativo · Inglés intermedio · Alemán básico'),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('Francisco-Ponte-CV.docx', buffer);
  console.log('CV generado:', buffer.length, 'bytes');
});
