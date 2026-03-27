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

Descripcion de lo realizado
----------

Para habilitar RLS y lograr restringir datos de la base de datos lo primero fue Habilitar RLS en la tabla de contactos usando:
```
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
```
Una vez hecho cree politicas de acceso para indicar que solo debia mostrarse informacion de la organización especificada usando comandos estilo:
```
CREATE POLICY policy_name
ON contacts
FOR ALL -- Aplicar en operaciones tipo  SELECT, INSERT, UPDATE, DELETE
USING (CONDITION);
```

Desafios
--------
Los principales desafios para este proyecto fueron los siguentes:
 - Usar nuevos herramientas de desarollo(Hono, Next, Better Auth) a los cuales no estoy acostumbrado e implementar una logica de desarrollo estilo API para crear empresas
 - Crear politicas para filtrar información clave de los contactos, sin mostrar informacion no solicitada(empresas externas), para esto ultimo el desafio consistio en que no era a nivel código los filtros por realizar sino a nivel Base de datos.
 - Implementar autenticacion con la Herramienta Better Auth dado que esta ya contiene logica de autenticación implementada como algunas rutas de registro, login y logica en el manejo de cookies de sesion

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
