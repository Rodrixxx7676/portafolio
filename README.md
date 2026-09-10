# Portafolio de Francisco

Sitio personal para que cualquier reclutador entre, vea los proyectos y llegue
al código o a la demo en dos clics.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS 4
- **Backend:** Node.js + Express + TypeScript
- **Infraestructura:** un único entorno de AWS Elastic Beanstalk (Node.js)
- **Arquitectura:** Model–View–ViewModel en el cliente, y una separación
  equivalente (modelo / servicio / controlador) en el servidor
- **Idiomas:** español e inglés, con selector en el header

## Cómo funciona el flujo de dos clics

1. El reclutador hace clic en la tarjeta de un proyecto.
2. Se abre una ventana flotante con la documentación: el `README.md` del
   repositorio, traído en vivo desde la API de GitHub y renderizado por ella.
3. Dentro de esa ventana, un segundo clic lleva al proyecto real: **Ver demo en
   vivo** si el proyecto está desplegado, y **Ver código en GitHub** siempre.

El README nunca se copia a mano: se lee de GitHub, se sanea en el servidor
(lista blanca de etiquetas, enlaces con `rel="noopener"`) y se cachea 30 minutos
en memoria para no agotar el límite de peticiones de la API.

## Arquitectura MVVM

```
shared/          Contrato de dominio compartido (Project, Profile, …)

client/src/
  models/          MODEL      Tipos + repositorios que hablan con la API
    repositories/             HttpClient, ProjectRepository, ProfileRepository
  viewmodels/      VIEWMODEL  Hooks con el estado y las reglas de presentación
                              useProjectsViewModel, useProjectDocumentationViewModel,
                              useProfileViewModel, useLocale
  views/           VIEW       Componentes puros: reciben datos ya formateados
    components/               ProjectCard, ProjectModal, Header, Footer…
    sections/                 Hero, Projects, About, Experience, Skills, Contact

server/src/
  models/          MODEL      Acceso a datos: catálogo JSON y API de GitHub
  services/        Reglas de negocio: combinar catálogo + GitHub
  controllers/     Traducción HTTP ↔ servicios
  routes/          Composición de dependencias
```

La regla que sostiene todo: **una vista nunca llama a `fetch` ni formatea una
fecha**, y **un ViewModel nunca contiene JSX**. Si un componente necesita datos
nuevos, se amplía su ViewModel.

## Puesta en marcha

```bash
npm install
npm run dev
```

`npm run dev` levanta el servidor Express en `http://localhost:8080` y Vite en
`http://localhost:5173`. Abre **el puerto 5173**: Vite hace proxy de `/api` al
servidor, igual que en producción los sirve el mismo proceso.

Para probar el modo producción en local:

```bash
npm run build && npm start
```

## Cómo agregar un proyecto

Edita `server/data/catalog.json` y agrega una entrada:

```json
{
  "id": "mi-proyecto",
  "title": "Mi Proyecto",
  "summary": { "es": "Qué resuelve y con qué.", "en": "What it solves and how." },
  "tags": ["React", "PostgreSQL"],
  "status": "produccion",
  "repo": "mi-usuario/mi-repo",
  "demoUrl": "https://mi-demo.com",
  "featured": true
}
```

- `repo`: `owner/repo`. De ahí salen el README, las estrellas y el lenguaje.
- `demoUrl`: opcional. Si se deja vacío se usa la *homepage* declarada en GitHub.
- `status`: `produccion`, `activo`, `archivado` o `experimento`.
- `featured: true` sube el proyecto al principio de la lista.
- `fallbackDoc`: HTML propio para proyectos sin README público.

Los demás archivos de `server/data/` son igual de editables: `profile.json`
(datos de contacto y bio), `timeline.json` (experiencia y educación) y
`skills.json` (stack técnico).

El CV en PDF va en `client/public/cv/` con los nombres que declare
`profile.json`.

## Variables de entorno

| Variable | Para qué sirve | Obligatoria |
|---|---|---|
| `PORT` | Puerto del servidor. Beanstalk inyecta `8080`. | No |
| `GITHUB_USER` | Usuario por defecto cuando `repo` no trae el owner. | No |
| `GITHUB_TOKEN` | Sube el límite de la API de GitHub de 60 a 5000 peticiones/hora. | No |
| `GITHUB_CACHE_TTL_MINUTES` | Minutos de caché de las respuestas de GitHub (30 por defecto). | No |
| `HTTPS_ENABLED` | Ponla en `true` **solo** cuando el sitio se sirva por HTTPS con certificado. Activa HSTS y la exigencia de HTTPS en la política de seguridad. | No |
| `ANALYTICS_TOKEN` | Contraseña para consultar el resumen de visitas. Sin ella, el resumen no se sirve. | No |
| `ANALYTICS_DIR` | Dónde se guardan los sucesos. Por defecto, la carpeta temporal del sistema. | No |

> Un entorno de Elastic Beanstalk recién creado escucha solo en HTTP. Si activas
> `HTTPS_ENABLED` sin tener certificado, el navegador pedirá cada archivo por
> HTTPS, no obtendrá respuesta y la página se quedará en blanco.

Copia `.env.example` a `.env` para el desarrollo local. **El token nunca se
commitea**: en AWS se carga con `eb setenv`.

## Despliegue en AWS Elastic Beanstalk

El build se hace en tu máquina, no en la instancia EC2: Beanstalk instala solo
dependencias de producción, así que compilar allá fallaría al no encontrar
TypeScript ni Vite. `npm run bundle` genera `deploy/portafolio.zip` con el
código ya compilado y un `package.json` reducido al runtime.

### Primera vez

```bash
pip install awsebcli --upgrade --user
eb init -p node.js-22 portafolio-francisco --region us-east-1
eb create portafolio-prod --instance-types t3.micro --single
```

`--single` crea el entorno sin balanceador de carga: es la opción más barata y
suficiente para un portafolio.

### Decirle a la EB CLI que suba el zip

Después de `eb init`, agrega estas dos líneas al final de
`.elasticbeanstalk/config.yml`:

```yaml
deploy:
  artifact: deploy/portafolio.zip
```

Sin eso, `eb deploy` subiría el código fuente sin compilar y el arranque
fallaría en la instancia.

### Cada despliegue

```bash
npm run bundle && eb deploy
```

También puedes subir `deploy/portafolio.zip` a mano desde la consola de AWS.

Si prefieres la consola web: crea la aplicación, elige la plataforma
**Node.js 22 en Amazon Linux 2023** y sube `deploy/portafolio.zip`.

### Token de GitHub en el entorno

```bash
eb setenv GITHUB_USER=tu-usuario GITHUB_TOKEN=ghp_xxx
```

### Que no se llene el almacenamiento de versiones

Cada "Cargar e implementar" guarda una copia del paquete en S3. Con ~0,25 MB
por versión, el tope de 500 MB da para unas 2000 y la cuota de 1000 versiones
por región se alcanzaría antes, pero conviene no acumularlas.

La solución es una política de ciclo de vida, que se configura una sola vez:
consola de Elastic Beanstalk → la aplicación **Repositorio** → *Configuración
del ciclo de vida de versiones de la aplicación*. Ahí se limita por número (por
ejemplo, conservar las 20 últimas) o por antigüedad, y **hay que marcar la
casilla que borra también el paquete de S3**: sin ella se elimina el registro
de la versión pero el archivo sigue ocupando espacio.

Para borrar a mano: *Versiones de la aplicación* → seleccionar las antiguas →
*Eliminar*. Nunca se borra la versión que está desplegada.

### Comprobación de salud

El balanceador consulta `/health`, que responde sin tocar la API de GitHub. Si
GitHub falla o agota su cuota, el sitio sigue en pie: las tarjetas se muestran
con los datos curados y sin métricas.

## Estadísticas de visitas

El sitio registra su propio uso, sin cookies, sin servicios de terceros y sin
guardar direcciones IP ni agentes de usuario: no hay forma de seguir a nadie
entre visitas. Se anotan cinco cosas — visita, descarga de CV, proyecto
abierto, salida a la demo y salida al código —, junto con el dominio de
procedencia y si el visitante venía de móvil o de escritorio. Quien navega con
la señal «Do Not Track» activada no se registra.

Para consultarlo, define un testigo en el entorno:

```bash
eb setenv ANALYTICS_TOKEN=una-clave-larga-y-privada
```

Y luego abre en el navegador:

```
http://TU-DOMINIO/api/stats?token=una-clave-larga-y-privada&days=30
```

> **Los datos viven en el disco de la instancia**, así que se pierden al
> redesplegar o al reiniciarla. Para conservarlos habría que llevarlos a S3 o
> a una base de datos; sirve tal cual para hacerse una idea semana a semana.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Express + Vite en paralelo, con recarga |
| `npm run build` | Compila `shared`, `server` y `client` |
| `npm start` | Sirve el build compilado en un solo proceso |
| `npm run typecheck` | Verifica tipos en todos los workspaces |
| `npm run bundle` | Genera `deploy/portafolio.zip` para Beanstalk |
| `npm run clean` | Borra los artefactos de build |

## Pendientes de contenido

Estos archivos tienen marcadores que hay que reemplazar antes de compartir el
sitio con un reclutador:

- `server/data/catalog.json` → el proyecto **Clack** tiene el resumen, las
  etiquetas y el bloque `fallbackDoc` con texto de relleno en mayúsculas.
  Como el repositorio es privado, GitHub no puede entregar su `README.md`: esa
  documentación se escribe a mano ahí, en HTML simple.
- `server/data/timeline.json` → está vacío a propósito, así la sección de
  experiencia no se dibuja. Al cargar entradas reales reaparece sola, junto con
  su enlace en el menú.
- `server/data/profile.json` → `resumeUrl` está vacío para que el botón de CV no
  lleve a un 404. Sube el PDF a `client/public/cv/` y apunta la ruta ahí.
- `server/data/skills.json` → los niveles del 1 al 5 son una estimación a partir
  de las tecnologías de tus repositorios; ajústalos.
