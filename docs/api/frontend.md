# API de usuarios: guía para el frontend

Rutas que puede usar el frontend, qué hay que enviar y qué devuelve cada una.

## Datos generales

- **Formato:** los bodies se envían y se reciben en JSON. Hay que mandar el header `Content-Type: application/json`.
- **CORS:** está habilitado para cualquier origen.
- **URL base:** la del despliegue en Vercel. En local es `http://localhost:5000`, o el `PORT` que esté configurado.

## Autenticación

Las rutas protegidas piden el JWT en el header `Authorization`:

```
Authorization: Bearer <token>
```

- **Cómo se obtiene:** con `POST /sesiones` (login) o `POST /usuarios` (registro).
- **Vencimiento:** a la hora. No hay refresh token: cuando vence, el usuario tiene que volver a iniciar sesión.
- **Logout:** `DELETE /sesiones` invalida el token en el servidor. Después de llamarlo, conviene borrarlo también del lado del frontend.
- **Contenido:** el token es un JWT estándar. Su payload trae el `id` y el `rol` del usuario, así que el frontend lo puede decodificar (por ejemplo con `jwt-decode`) para saber qué pantallas mostrar. Para el resto de los datos (nombre, email, etc.) está `GET /usuarios/me`.

```json
{ "id": "6ae761442b19072bbffa20c2", "rol": "administrador", "iat": 1793548800, "exp": 1793552400, "jti": "..." }
```

> El rol del token sirve para mostrar u ocultar cosas en la interfaz. Quien controla los permisos de verdad es el backend: si el rol no alcanza, responde `403`.

### Roles

| Rol | Qué puede hacer |
|---|---|
| `cliente` | Iniciar y cerrar sesión, ver su perfil. Es el rol de todo el que se registra desde `POST /usuarios`. |
| `profesional` | Lo mismo que el cliente. Solo lo puede crear un administrador. |
| `administrador` | Además, listar, ver y desactivar usuarios, y crear profesionales y administradores. |

## Respuestas de error comunes

Todas las rutas protegidas pueden devolver estos errores:

| Status | Body | Cuándo |
|---|---|---|
| `401` | Texto plano `Unauthorized` (no es JSON) | Falta el token, es inválido, venció o la sesión fue cerrada. Lo que corresponde es mandar al usuario al login. |
| `403` | `{ "message": "Acceso denegado" }` | El token es válido, pero el rol no tiene permiso para esa ruta. |
| `500` | `{ "message": "error interno del servidor" }` | Error inesperado del servidor. |

Además, cualquier ruta que no exista devuelve `404` con el texto plano `Ruta inválida.`

> **Ojo:** el `401` de las rutas protegidas no trae JSON. Hay que revisar `response.status` antes de hacer `response.json()`.

## Modelo de usuario

Así viene un usuario en las respuestas:

```json
{
  "_id": "6ae761442b19072bbffa20c3",
  "nombre": "Martín",
  "apellido": "Sosa",
  "email": "martin.sosa@example.com",
  "rol": "profesional",
  "activo": true,
  "fecha_registro": "2026-11-01T14:00:00.000Z"
}
```

- El id viene en `_id`, no en `id`.
- `fecha_registro` es una fecha ISO 8601 en UTC.
- La contraseña nunca viene en las respuestas.

## Resumen de rutas

| Método | Ruta | Requiere | Para qué sirve |
|---|---|---|---|
| `POST` | `/sesiones` | Nada | Iniciar sesión |
| `DELETE` | `/sesiones` | Token | Cerrar sesión |
| `POST` | `/usuarios` | Nada | Registrarse como cliente |
| `GET` | `/usuarios/me` | Token | Ver el perfil propio |
| `GET` | `/usuarios` | Token de administrador | Listar usuarios activos |
| `GET` | `/usuarios/:id` | Token de administrador | Ver un usuario |
| `DELETE` | `/usuarios/:id` | Token de administrador | Desactivar un usuario |
| `POST` | `/admin/usuarios` | Token de administrador | Crear un profesional o administrador |

---

## `POST /sesiones`: iniciar sesión

**Body:**

```json
{ "email": "ana@mail.com", "password": "secreta123" }
```

**Respuestas:**

| Status | Body | Cuándo |
|---|---|---|
| `200` | `{ "token": "eyJhbGciOi..." }` | Credenciales correctas. |
| `401` | `{ "message": "Usuario no autorizado" }` | Email inexistente o contraseña incorrecta (las dos dan la misma respuesta). |
| `403` | `{ "message": "Cuenta deshabilitada" }` | Credenciales correctas, pero la cuenta fue desactivada por un administrador. |

El email no distingue mayúsculas de minúsculas.

**Ejemplo:**

```js
const res = await fetch(`${API_URL}/sesiones`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});

if (res.ok) {
  const { token } = await res.json();
  localStorage.setItem("token", token);
} else {
  const { message } = await res.json();
  // mostrar message al usuario
}
```

## `DELETE /sesiones`: cerrar sesión

**Headers:** `Authorization: Bearer <token>`. No lleva body.

**Respuestas:**

| Status | Body | Cuándo |
|---|---|---|
| `204` | Sin contenido | Sesión cerrada. Ese token ya no sirve en ninguna ruta. |
| `401` | Texto plano | Falta el token, es inválido o la sesión ya estaba cerrada. |

Solo cierra la sesión del token enviado: si el usuario inició sesión en otro dispositivo, esa sesión sigue activa.

**Ejemplo:**

```js
await fetch(`${API_URL}/sesiones`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` }
});
localStorage.removeItem("token");
```

## `POST /usuarios`: registro de cliente

Crea un usuario con rol `cliente` y devuelve un token, así que el usuario queda con la sesión iniciada sin pasar por el login.

**Body** (los cuatro campos son obligatorios):

```json
{ "nombre": "Ana", "apellido": "Pérez", "email": "ana@mail.com", "password": "secreta123" }
```

**Respuestas:**

| Status | Body | Cuándo |
|---|---|---|
| `201` | `{ "token": "eyJhbGciOi..." }` | Usuario creado. |
| `400` | `{ "message": "Datos inválidos", "error": "..." }` | Falta algún campo. `error` es un detalle técnico en inglés: conviene mostrar un mensaje propio. |
| `409` | `{ "message": "El email ya está registrado" }` | Ya existe un usuario con ese email. |

- El rol no se puede elegir: si se manda `rol` en el body, se ignora.
- El backend no valida largo de contraseña ni formato de email: si se quieren esas reglas, hay que validarlas en el formulario.

## `GET /usuarios/me`: perfil propio

Disponible para cualquier rol.

**Headers:** `Authorization: Bearer <token>`

**Respuestas:**

| Status | Body | Cuándo |
|---|---|---|
| `200` | `{ ...usuario }` | El usuario existe y está activo. |
| `401` | Texto plano | Token faltante, inválido o vencido. |
| `404` | `{ "message": "Usuario no encontrado" }` | El usuario fue desactivado después de iniciar sesión. Conviene tratarlo como un logout. |

**Ejemplo de respuesta `200`:**

```json
{
  "_id": "6ae761442b19072bbffa20c4",
  "nombre": "Sofía",
  "apellido": "Ramírez",
  "email": "sofia.ramirez@example.com",
  "rol": "cliente",
  "activo": true,
  "fecha_registro": "2026-11-01T14:00:00.000Z"
}
```

## `GET /usuarios`: listar usuarios

Solo administradores. Devuelve todos los usuarios activos, de cualquier rol. No tiene paginación ni filtros: si hace falta filtrar (por ejemplo, solo profesionales), se hace en el frontend.

**Headers:** `Authorization: Bearer <token>`

**Respuestas:**

| Status | Body | Cuándo |
|---|---|---|
| `200` | `[ ...usuarios ]` | Siempre que el token sea de un administrador. Si no hay usuarios, devuelve `[]`. |
| `401` | Texto plano | Token faltante, inválido o vencido. |
| `403` | `{ "message": "Acceso denegado" }` | El token no es de un administrador. |

**Ejemplo de respuesta `200`:**

```json
[
  { "_id": "6ae761442b19072bbffa20c2", "nombre": "Laura", "apellido": "Méndez", "email": "laura.mendez@example.com", "rol": "administrador", "activo": true, "fecha_registro": "2026-11-01T14:00:00.000Z" },
  { "_id": "6ae761442b19072bbffa20c3", "nombre": "Martín", "apellido": "Sosa", "email": "martin.sosa@example.com", "rol": "profesional", "activo": true, "fecha_registro": "2026-11-01T14:00:00.000Z" }
]
```

## `GET /usuarios/:id`: ver un usuario

Solo administradores. `:id` es el `_id` del usuario.

**Headers:** `Authorization: Bearer <token>`

**Respuestas:**

| Status | Body | Cuándo |
|---|---|---|
| `200` | `{ ...usuario }` | El usuario existe y está activo. |
| `401` | Texto plano | Token faltante, inválido o vencido. |
| `403` | `{ "message": "Acceso denegado" }` | El token no es de un administrador. |
| `404` | `{ "message": "Usuario no encontrado" }` | No existe, está desactivado o el id no tiene un formato válido. |

## `DELETE /usuarios/:id`: desactivar un usuario

Solo administradores. Es una **baja lógica**: el usuario no se borra, queda con `activo: false`. Desde ese momento no puede iniciar sesión (recibe `403 Cuenta deshabilitada`) y deja de aparecer en los listados. No hay ruta para reactivarlo.

**Headers:** `Authorization: Bearer <token>`. No lleva body.

**Respuestas:**

| Status | Body | Cuándo |
|---|---|---|
| `200` | `{ ...usuario, "activo": false }` | El usuario se desactivó. |
| `401` | Texto plano | Token faltante, inválido o vencido. |
| `403` | `{ "message": "Acceso denegado" }` | El token no es de un administrador. |
| `404` | `{ "message": "Usuario no encontrado" }` | No existe o ya estaba desactivado. |

> El backend no impide que un administrador se desactive a sí mismo. Conviene que la interfaz no ofrezca esa opción sobre el usuario logueado.

## `POST /admin/usuarios`: crear profesional o administrador

Solo administradores. El usuario se crea con una contraseña temporal generada por el servidor, que no se devuelve en la respuesta.

**Headers:** `Authorization: Bearer <token>`

**Body** (los cuatro campos son obligatorios):

```json
{ "nombre": "Laura", "apellido": "Gómez", "email": "laura@mail.com", "rol": "profesional" }
```

`rol` tiene que ser `"profesional"` o `"administrador"`.

**Respuestas:**

| Status | Body | Cuándo |
|---|---|---|
| `201` | `{ ...usuario }` | Usuario creado. |
| `400` | `{ "message": "Datos inválidos", "error": "..." }` | Falta algún campo o `rol` no es válido. |
| `401` | Texto plano | Token faltante, inválido o vencido. |
| `403` | `{ "message": "Acceso denegado" }` | El token no es de un administrador. |
| `409` | `{ "message": "El email ya está registrado" }` | Ya existe un usuario con ese email. |

> **Pendiente en el backend:** la contraseña temporal todavía no se envía por mail, así que los usuarios creados desde esta ruta todavía no pueden iniciar sesión.

---

## Rutas que no son para el frontend

`GET /interno/usuarios/:id` es solo para comunicación entre servicios (la usa la API de turnos). Se autentica con una clave interna que nunca debe estar en el frontend.
