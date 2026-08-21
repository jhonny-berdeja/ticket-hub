# ticket-hub

## ¿Para qué es este proyecto?

Este proyecto es el frontend de la ticketera del ecosistema jtagram. Permite crear y gestionar tickets para solicitar la administración del servidor pcbox, la gestión de bases de datos y la gestión de Kubernetes. La aplicación se autentica contra `auth-api` y, una vez logueado, consume la API de `ticket-hub-api` para listar, crear y aprobar tickets. Está construida con Next.js (App Router), usando Route Handlers propios como capa intermedia entre el navegador y los backends internos, de forma que el token de sesión nunca llega al JavaScript del cliente.

## ¿Qué hace cada página?

**`/login`** — Formulario de inicio de sesión (email y contraseña). Al enviarse, llama al Route Handler interno de login, que autentica contra `auth-api` y guarda el token recibido en una cookie httpOnly.

**`/home`** — Landing de la sección autenticada. Hoy solo muestra el título "Ticket Hub"; la navegación real vive en la barra lateral (`TicketsSidebar`), montada en el layout de `/home` y visible en toda la app autenticada.

**`/home/tickets`** — Landing de la sección de tickets. Es una página de estructura únicamente: los puntos de entrada a las funciones (ver listado, crear ticket) están en la barra lateral y no se repiten acá.

**`/home/tickets/list`** — Listado de tickets (ABMC). Obtiene los tickets desde la API en cada montaje (por lo tanto se refresca cada vez que se vuelve a esta ruta, por ejemplo tras crear o aprobar un ticket) y los muestra en una tabla, con estados de carga y error.

**`/home/tickets/create`** — Formulario para crear un nuevo ticket. Es una página de layout normal (no un modal), con el formulario `CreateTicketForm` dentro de una tarjeta.

**`/home/tickets/[number]`** — Detalle de un ticket puntual. `datacenter_tickets` y `database_tickets` tienen cada una su propia secuencia de `id` interno, así que un lookup por `id` es ambiguo (ambas tablas pueden tener un ticket con el mismo `id`). Por eso esta ruta identifica al ticket por su `number` de display, único (`DC-1`, `DB-1`), y trae ese ticket puntual con `GET /tickets/by-number/:displayNumber` en vez de traer el listado completo y buscarlo en el cliente. Contempla los estados de carga, error de carga y ticket no encontrado.

## ¿Qué variables de entorno necesito?

### Variables para el pipeline de GitHub Actions

El workflow `release-ticket-hub.yml` (y el flujo de deploy que dispara en `infra-hub`) necesita los siguientes secretos de repositorio. El procedimiento detallado para obtener cada uno está en [`.github/workflows/obtain-secrets.md`](.github/workflows/obtain-secrets.md).

- **`DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN`** — Credenciales de Docker Hub usadas para publicar la imagen de `ticket-hub` y para borrar los tags viejos después de cada release. `DOCKERHUB_USERNAME` es la cuenta u organización de Docker Hub bajo la que se publica la imagen; `DOCKERHUB_TOKEN` es un access token de esa cuenta con permisos de **Read, Write, Delete** (no alcanza con "Read & Write" porque el job de limpieza necesita poder borrar tags), generado desde Docker Hub en Account Settings > Security > New Access Token.
- **`INFRA_HUB_DISPATCH_TOKEN`** — Personal access token fine-grained de GitHub usado para disparar el workflow de deploy en `infra-hub` y consultar el estado de esa corrida. Se genera desde GitHub (Developer settings > Personal access tokens > Fine-grained tokens) con acceso solo al repositorio `infra-hub`, permisos `Actions: Read and write` y `Contents: Read-only`, y se guarda como secreto en **este** repositorio (ticket-hub), no en infra-hub.

### Variables para el funcionamiento de la app

En runtime, la app (los Route Handlers bajo `app/api/`) necesita estas variables de entorno. Se definen como variables del Deployment de Kubernetes en `infra-hub` (`apps/ticket-hub/deployment.yaml`), no se configuran localmente:

- **`TICKET_HUB_API_URL`** — URL base de `ticket-hub-api`, usada por los Route Handlers de tickets y de usuario actual (`me`, `tickets`, `tickets/[id]/approve`, `tickets/by-number/[number]`). En el cluster apunta al Service interno de `ticket-hub-api` vía DNS de microk8s (`http://ticket-hub-api.ticket-hub.svc.cluster.local:3000`).
- **`AUTH_API_URL`** — URL base de `auth-api`, usada solo por el login (`app/api/login/route.ts`), ya que la autenticación se hace contra `auth-api` y no contra `ticket-hub-api`. Apunta al Service interno de `auth-api` (`http://auth-api.auth-api.svc.cluster.local:3000`).
- **`TICKET_HUB_APPLICATION_NAME`** — Nombre de la aplicación registrada en la tabla `applications` de `auth-api`, contra la cual se valida el acceso del usuario que hace login. Se obtiene del secreto de Kubernetes `ticket-hub-credentials` (ver `infra-hub/apps/ticket-hub/secret.example.yaml`), nunca se hardcodea.
- **`TICKET_HUB_COOKIE_SECURE`** — Controla el flag `secure` de la cookie de sesión (`"true"`/`"false"`). En el deploy actual está en `"false"` porque no hay Ingress/TLS delante de la app; ponerlo en `true` sin TLS haría que el navegador descarte la cookie de login silenciosamente.

## ¿Cómo se ejecuta la app?

La app no se corre localmente en el flujo normal: se ejecuta como un Pod dentro del cluster de microk8s alojado en el servidor pcbox. Para desplegar una nueva versión hay que ir al workflow **Release ticket-hub** (`release-ticket-hub.yml`) en GitHub Actions y ejecutarlo manualmente (`workflow_dispatch`), completando dos inputs:

- **`previous_stable_tag`** — El tag que se mantiene como la última versión estable conocida. El workflow lo valida contra los tags existentes (en git y en Docker Hub) y lo conserva al limpiar tags viejos de Docker Hub al final del proceso.
- **`new_tag`** — El nuevo tag de versión a construir, publicar y desplegar. Debe ser un tag que todavía no exista ni en git ni en Docker Hub.

El workflow valida los secretos y los tags, construye y publica la imagen Docker con el `new_tag`, crea el tag de git correspondiente y luego dispara (vía `INFRA_HUB_DISPATCH_TOKEN`) el workflow `deploy-ticket-hub.yml` del repositorio `infra-hub`, pasándole el tag de imagen a desplegar. Es ese workflow de `infra-hub` el que se conecta al cluster de microk8s en pcbox (a través de Tailscale) y aplica los manifiestos de Kubernetes, dejando la nueva imagen corriendo. El job de `release-ticket-hub.yml` espera a que esa corrida en `infra-hub` termine antes de continuar con la limpieza de tags viejos en Docker Hub.
