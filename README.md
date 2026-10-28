# API de usuarios

API REST para la gestión de usuarios: registro, login con JWT, consulta y baja de usuarios, y alta de profesionales y administradores.

También expone un endpoint interno para que otros servicios (por ejemplo, la API de turnos) consulten datos de un usuario.

## Tecnologías

- Node.js + Express
- MongoDB (con Mongoose)
- JSON Web Token (JWT) para la autenticación
- Contraseñas hasheadas con `scrypt` y salt aleatorio (módulo `crypto` de Node)

## Puesta en marcha

### Requisitos

- Node.js 20.19 o superior (lo exige Mongoose)
- Una base de datos MongoDB (local o en la nube, por ejemplo MongoDB Atlas)

### Instalación

```bash
npm install
```

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb://localhost:27017/usuarios
JWT_SECRET_KEY=una-clave-larga-y-secreta
PORT=5000
INTERNAL_API_KEY=clave-compartida-con-la-api-de-turnos
```

| Variable | Obligatoria | Descripción |
|---|---|---|
| `MONGODB_URI` | Sí | Cadena de conexión a MongoDB. Si falta, la aplicación no arranca. |
| `JWT_SECRET_KEY` | Sí | Clave con la que se firman y verifican los JWT. |
| `PORT` | No | Puerto del servidor. Por defecto `5000`. |
| `INTERNAL_API_KEY` | Para `/interno` | Clave compartida con los otros servicios. Si no está definida, el endpoint interno rechaza todas las peticiones. |

El archivo `.env` está en `.gitignore`: nunca se sube al repositorio.

### Ejecución

```bash
npm start
```

El servidor se reinicia solo al guardar cambios (`node --watch`). Arranca recién cuando la conexión a MongoDB está establecida.

## Autenticación

Las rutas protegidas requieren un JWT en el header `Authorization`:

```
Authorization: Bearer <token>
```

El token se obtiene al iniciar sesión (`POST /sesiones`) o al registrarse (`POST /usuarios`). Contiene el `id` y el `rol` del usuario, y vence a la hora. Deja de servir antes si se cierra la sesión con `DELETE /sesiones`.

Si el token falta, es inválido o venció, la API responde `401 Unauthorized`. Si el token es válido pero el rol no tiene permiso para esa ruta, responde `403` con `{ "message": "Acceso denegado" }`.

### Roles

| Rol | Cómo se obtiene |
|---|---|
| `cliente` | Registrándose desde `POST /usuarios`. |
| `profesional` | Lo da de alta un administrador desde `POST /admin/usuarios`. |
| `administrador` | Lo da de alta otro administrador desde `POST /admin/usuarios`. |

> **Primer administrador:** como solo un administrador puede crear otro, el primero hay que crearlo a mano: registrar un usuario normal y cambiarle el campo `rol` a `"administrador"` directamente en MongoDB.

## Rutas

| Método | Ruta | Autenticación | Para qué sirve |
|---|---|---|---|
| `POST` | `/sesiones` | Pública | Iniciar sesión |
| `DELETE` | `/sesiones` | JWT | Cerrar sesión |
| `POST` | `/usuarios` | Pública | Registrarse como cliente |
| `GET` | `/usuarios` | JWT de administrador | Listar usuarios activos |
| `GET` | `/usuarios/me` | JWT | Ver el perfil propio |
| `GET` | `/usuarios/:id` | JWT de administrador | Ver un usuario |
| `DELETE` | `/usuarios/:id` | JWT de administrador | Desactivar un usuario |
| `POST` | `/admin/usuarios` | JWT de administrador | Dar de alta un profesional o administrador |
| `GET` | `/interno/usuarios/:id` | `X-API-Key` | Consulta entre servicios |

Cualquier otra ruta responde `404` con el texto `Ruta inválida.`

Si ocurre un error inesperado, cualquier ruta responde `500` con `{ "message": "error interno del servidor" }`. El detalle del error se registra en el log del servidor y no se envía al cliente.

### `POST /sesiones`: iniciar sesión

Valida email y contraseña y devuelve un JWT.

```json
{ "email": "ana@mail.com", "password": "secreta123" }
```

| Respuesta | Cuándo |
|---|---|
| `200` `{ "token": "..." }` | Credenciales correctas. |
| `401` `{ "message": "Usuario no autorizado" }` | El email no existe o la contraseña es incorrecta. Las dos situaciones dan la misma respuesta, para no revelar qué emails están registrados. |
| `403` `{ "message": "Cuenta deshabilitada" }` | Credenciales correctas, pero la cuenta fue desactivada. |

### `DELETE /sesiones`: cerrar sesión

Invalida el token con el que se hace la petición. No lleva body: alcanza con el header `Authorization`.

| Respuesta | Cuándo |
|---|---|
| `204` (sin contenido) | Sesión cerrada. A partir de ahora ese token recibe `401` en todas las rutas. |
| `401` | Falta el token, es inválido o la sesión ya estaba cerrada. |

Cierra solo la sesión de ese token: si el usuario inició sesión en otro dispositivo, esa otra sesión sigue activa.

Los tokens cerrados se guardan en la colección `revokedtokens` de MongoDB, y MongoDB los borra solo cuando vencen.

> **Otros servicios:** la revocación solo la conoce esta API. Un servicio que valida el JWT por su cuenta, como la API de turnos, va a seguir aceptando el token hasta que venza (como máximo 1 hora).

### `POST /usuarios`: registro de cliente

Crea un usuario con rol `cliente` y lo deja con la sesión iniciada.

```json
{ "nombre": "Ana", "apellido": "Pérez", "email": "ana@mail.com", "password": "secreta123" }
```

| Respuesta | Cuándo |
|---|---|
| `201` `{ "token": "..." }` | Usuario creado. |
| `400` `{ "message": "Datos inválidos", "error": "..." }` | Falta algún campo. |
| `409` `{ "message": "El email ya está registrado" }` | Ya existe un usuario con ese email. |

El email se guarda en minúsculas y sin espacios. El rol no se puede elegir: siempre es `cliente`.

### `GET /usuarios`: listar usuarios

Solo para administradores. Devuelve todos los usuarios activos.

| Respuesta | Cuándo |
|---|---|
| `200` `{ "message": "Lista de usuarios", "payload": [ ... ] }` | El token es de un administrador. |
| `403` `{ "message": "Acceso denegado" }` | El token no es de un administrador. |

### `GET /usuarios/me`: perfil propio

Disponible para cualquier usuario con sesión iniciada, sin importar el rol. Devuelve los datos del usuario dueño del token.

| Respuesta | Cuándo |
|---|---|
| `200` `{ "message": "Usuario encontrado", "payload": { ... } }` | El usuario existe y está activo. |
| `404` `{ "message": "Usuario no encontrado" }` | El usuario fue desactivado después de emitirse el token. |

### `GET /usuarios/:id`: ver un usuario

Solo para administradores.

| Respuesta | Cuándo |
|---|---|
| `200` `{ "message": "Usuario encontrado", "payload": { ... } }` | El usuario existe y está activo. |
| `404` `{ "message": "Usuario no encontrado" }` | No existe, está inactivo o el id no tiene un formato válido. |
| `403` `{ "message": "Acceso denegado" }` | El token no es de un administrador. |

### `DELETE /usuarios/:id`: desactivar un usuario

Solo para administradores. Hace una **baja lógica**: el usuario no se borra, se marca con `activo: false`. Desde ese momento no puede iniciar sesión ni aparece en las consultas.

| Respuesta | Cuándo |
|---|---|
| `200` `{ "message": "Usuario desactivado", "payload": { ... } }` | El usuario se desactivó. |
| `404` `{ "message": "Usuario no encontrado" }` | No existe o ya estaba inactivo. |
| `403` `{ "message": "Acceso denegado" }` | El token no es de un administrador. |

### `POST /admin/usuarios`: alta de profesional o administrador

Solo para administradores. Crea el usuario con una contraseña temporal generada al azar.

```json
{ "nombre": "Laura", "apellido": "Gómez", "email": "laura@mail.com", "rol": "profesional" }
```

| Respuesta | Cuándo |
|---|---|
| `201` `{ "message": "Usuario creado", "payload": { ... } }` | Usuario creado. |
| `400` `{ "message": "Datos inválidos", "error": "..." }` | Falta algún campo, o `rol` no es `profesional` ni `administrador`. |
| `401` | Falta el token o es inválido. |
| `403` `{ "message": "Acceso denegado" }` | El token no es de un administrador. |
| `409` `{ "message": "El email ya está registrado" }` | Ya existe un usuario con ese email. |

> **Pendiente:** la contraseña temporal todavía no se envía por mail, así que el usuario creado no puede iniciar sesión hasta que eso se implemente.

### `GET /interno/usuarios/:id`: consulta entre servicios

Pensada para que la API de turnos verifique a un usuario antes de darlo de alta como profesional. No usa JWT: se autentica con una clave compartida en el header `X-API-Key`, cuyo valor es el de `INTERNAL_API_KEY`.

```
X-API-Key: <INTERNAL_API_KEY>
```

| Respuesta | Cuándo |
|---|---|
| `200` `{ "nombre", "apellido", "rol", "activo" }` | El usuario existe. Se devuelve también si está inactivo, para que el servicio que consulta decida qué hacer. |
| `401` | Falta la clave o es incorrecta. |
| `404` `{ "message": "Usuario no encontrado" }` | No existe o el id no tiene un formato válido. |

## Modelo de usuario

Así se ve un usuario en las respuestas:

```json
{
  "_id": "6ae13d641901d2fe667d70ae",
  "nombre": "Ana",
  "apellido": "Pérez",
  "email": "ana@mail.com",
  "rol": "cliente",
  "activo": true,
  "fecha_registro": "2026-10-28T14:00:00.000Z"
}
```

La contraseña se guarda solo como hash (`password_hash`) y nunca se incluye en las respuestas.

## Estructura del proyecto

```
backend_usuarios/
├── index.js               Punto de entrada: configura Express y monta las rutas
├── src/
│   ├── config/            Conexión a MongoDB y variables de entorno
│   ├── routes/            Definición de endpoints y middlewares de cada uno
│   ├── controllers/       Lectura del request y armado de la respuesta HTTP
│   ├── services/          Lógica de negocio
│   ├── models/            Esquema de Mongoose del usuario
│   ├── middlewares/       Autenticación JWT, control de roles y API key interna
│   └── utils/             Hash de contraseñas y generación de JWT
└── docs/
    ├── database/          Diagrama entidad-relación
    └── sequences/         Diagramas de secuencia (PlantUML)
```

El flujo de una petición es: **ruta → middleware → controlador → servicio → modelo → MongoDB**.

## Documentación

Los diagramas de secuencia en `docs/sequences/` describen cada flujo:

- `login.md`: inicio de sesión.
- `register-client.md`: registro de clientes.
- `register-prof.md`: alta de profesionales por un administrador.
- `register-prof-turnos.md`: alta de un profesional en la API de turnos, que consulta a esta API por el endpoint interno.

Los cambios importantes del proyecto se registran en `CHANGELOG.md`.

## Despliegue

El proyecto incluye `vercel.json` para desplegarlo en Vercel. Las variables de entorno se configuran en el panel del proyecto en Vercel, no con el archivo `.env`.
