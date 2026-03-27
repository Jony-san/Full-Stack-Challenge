API de Gestión de Contactos
------------
Descripción general

Este proyecto implementa un sistema de gestión de contactos con soporte multi-tenant utilizando:

- Hono como framework de API
- Next.js como capa de routing (App Router)
- Better Auth para autenticación
- Drizzle ORM con PostgreSQL
- Middleware para aislamiento por tenant
- Estructura preparada para Row-Level Security (RLS)

El sistema permite que múltiples organizaciones (tenants) operen de forma aislada sobre los mismos recursos.

Objetivo
----------

Aislar datos por organización
Evitar acceso cruzado entre tenants
Preparar la arquitectura para implementar Row-Level Security (RLS) en PostgreSQL

Arquitectura
----------
Next.js (App Router)
   ↓
API Route Handler (/api/[[...route]])
   ↓
Aplicación Hono
   ├── Rutas de auth (/api/auth/*) → Better Auth
   ├── Rutas de contacts (/api/contacts)
   └── Middleware
         ├── Extracción de tenant (x-tenant-id)
         └── Middleware de auth (conceptual)
   ↓
Drizzle ORM
   ↓
PostgreSQL

Decisiones técnicas
----------
Hono + Next.js
Hono actúa como capa ligera de API
Next.js maneja el routing y entrada de requests
Un handler catch-all conecta Next con Hono
Better Auth
Maneja autenticación de usuarios
Independiente del framework de API
Persistencia en PostgreSQL
Drizzle ORM
ORM tipado
Modelado basado en schema
Integración directa con PostgreSQL
Row-Level Security (RLS)
Autenticación basada en organizaciones

Configuración
----------
secret: clave para firmar sesiones
baseURL: URL base de la aplicación
database: integración con Drizzle + PostgreSQL

Autenticación
----------

La autenticación se gestiona con Better Auth, que soporta:

Autenticación con email y contraseña
Manejo de sesiones (En proceso)
Integración con base de datos PostgreSQL


Estrategia Multi-Tenant
----------

La multi-tenencia se implementa utilizando un identificador de tenant por request.

El tenant se envía en el header:

x-tenant-id: <tenant>
Un middleware extrae el tenant y lo inyecta en el contexto:
c.set("tenantId", tenantId);
Todas las consultas a base de datos se filtran por tenantId.

Middleware
Middleware de Tenant
----------

Responsable de:

Leer el header x-tenant-id
Validar su existencia
Inyectarlo en el contexto de la request
Middleware de Autenticación (conceptual)
Validación de sesión de usuario
Protección de rutas privadas
Diseñado para integrarse con Better Auth

Base de Datos
----------

Se utiliza PostgreSQL con Drizzle ORM.

Tabla: contacts

Campos:

id (UUID, primary key)
tenant_id (string, obligatorio)
name (string, obligatorio)
email (opcional)
phone (opcional)
created_at (timestamp)

Cada registro está asociado a un tenant_id para garantizar aislamiento lógico.

Consideraciones de seguridad
----------

Aislamiento por tenant a nivel de aplicación
Middleware preparado para autenticación
Diseño compatible con RLS en base de datos
Separación entre lógica de auth y lógica de negocio

Mejoras futuras
----------

Integrar sesión de Better Auth dentro del contexto de Hono
Implementar políticas RLS en PostgreSQL
Sustituir header de tenant por organización proveniente de auth
Implementar frontend en Next.js para:
Registro e inicio de sesión
Gestión de contactos
Completar CRUD completo con validaciones
Agregar logging y monitoreo



Endpoints
----------

Autenticación (Better Auth)
POST /api/auth/email/sign-up
POST /api/auth/email/sign-in

Contacts
GET /api/contacts  (Consulta)
GET /api/contacts/id  (Consulta por Id)
POST /api/contacts (Creacion)
PUT /api/contacts (Actualización)
DELETE /api/contacts/id (Eliminación)

Todos los endpoints de contacts Requieren el header x-tenant-id

Están preparados para protección mediante middleware de autenticación
Filtran datos por tenant

Ejecucion
----------
```
npm install
```
Crear un archivo .env en la raíz del proyecto (usando un usuario y contraseña valido):
```
DATABASE_URL=postgres://{User}:{pasword}@localhost:5433/dorstep_db
BASE_URL=http://localhost:3000
BETTER_AUTH_SECRET=supersecretkey123j1827dnryx73ni8
```
Es necesario tener PostgreSQL corriendo (local o Docker).

Si usas Docker:
```
docker-compose up -d
```

Generar Migraciones
```
npx drizzle-kit generate
```
Aplicar Migracion
```
npx drizzle-kit migrate
```
Compilar Aplicación
```
npm run dev
```

Ejecucion de Pruebas
-----------
Para realizar la prueba de las rutas puede usar la terminal ejecutando:

Creacion
```
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: org1" \
  -d '{"name":"Maria"}'
```

Consultar contactos
```
curl http://localhost:3000/api/contacts \
  -H "x-tenant-id: org1"
```

Consultar contacto por Id
```
curl http://localhost:3000/api/contacts/{id} \
  -H "x-tenant-id: org1"
```

Eliminacion
```
curl -X DELETE http://localhost:3000/api/contacts/{id} \
  -H "x-tenant-id: org1”
```

Actualizacion
```
curl -X PUT http://localhost:3000/api/contacts/{id} \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: org1" \
  -d '{"name":"Maria"}'
```

Registro
```
curl -X POST http://localhost:3000/api/auth/email/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "123456"
  }'
```
Inicio de sesion
```
curl -X POST http://localhost:3000/api/auth/email/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "123456"
  }'
```

O bien puede importar la coleccion postman que se encuentra en la raiz de este documento y realizar las pruebas
