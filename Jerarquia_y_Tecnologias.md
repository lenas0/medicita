# Resumen del proyecto

Este proyecto es una API REST construida con Node.js y Express para consultar y registrar información en una base de datos MySQL. La aplicación también sirve una interfaz web sencilla desde la carpeta `public/`, donde el usuario puede enviar peticiones para listar, buscar y crear registros.

## 1. Objetivo

Permitir interactuar con una tabla llamada `test` en MySQL mediante una interfaz web y endpoints HTTP. El flujo principal consiste en:

- mostrar una página web desde el servidor,
- capturar datos del usuario desde formularios,
- enviar peticiones `fetch()` desde JavaScript del navegador,
- procesar esas solicitudes en Express,
- consultar o insertar datos en la base de datos con `mysql2`.

## 2. Jerarquía del proyecto

```text
proyecto/
├── dao/
│   └── test.dao.js
├── env/
│   └── mysqlConfig.js
├── public/
│   ├── index.html
│   └── js/
│       └── sql.js
├── routes/
│   └── test.routes.js
├── services/
│   └── mysql.service.js
├── .gitignore
├── ESTRUCTURA_CARPETAS.txt
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

### Descripción de carpetas

- `dao/`: contiene la lógica de acceso a datos. Aquí se ejecutan las consultas SQL.
- `env/`: guarda la configuración de conexión a MySQL.
- `public/`: archivos estáticos que el navegador usa: HTML y JavaScript.
- `routes/`: define los endpoints de la API.
- `services/`: centraliza servicios compartidos, como el pool de conexiones a MySQL.

## 3. Cómo funciona la aplicación

### Arranque del servidor

`server.js` es el punto de entrada del proyecto. En él se:

- crea la instancia de Express,
- habilita `express.json()` para leer JSON en las peticiones,
- sirve los archivos estáticos de `public/`,
- monta las rutas bajo `/test`,
- inicia el servidor en el puerto `5000`.

### API y rutas

El archivo `routes/test.routes.js` define tres endpoints principales:

- `GET /test` → devuelve todos los registros.
- `GET /test/:id` → devuelve un registro específico por su ID.
- `POST /test` → crea un nuevo registro con `name` y `birthdate`.

Cada ruta delega la operación al DAO correspondiente.

### Capa de acceso a datos

`dao/test.dao.js` contiene las funciones:

- `getAll()`
- `getById()`
- `create()`

Estas funciones usan el pool de MySQL para ejecutar consultas y devolver resultados o errores HTTP.

### Conexión a MySQL

`services/mysql.service.js` crea un pool de conexiones usando `mysql2/promise` y la configuración ubicada en `env/mysqlConfig.js`.

La configuración actual apunta a:

- host: `localhost`
- usuario: `root`
- contraseña: `root`
- base de datos: `test_db`

### Interfaz web

La página `public/index.html` incluye formularios y botones para:

- obtener todos los registros,
- obtener uno por ID,
- insertar un nuevo elemento.

El script `public/js/sql.js` usa `fetch()` para consumir la API y actualizar la interfaz con los resultados.

## 4. Flujo general de ejecución

1. El usuario abre `http://localhost:5000`.
2. El navegador carga la interfaz de `public/index.html`.
3. El usuario ejecuta una acción (consultar o guardar).
4. JavaScript en `public/js/sql.js` envía una petición HTTP a `/test`.
5. `routes/test.routes.js` redirige la solicitud al DAO adecuado.
6. `dao/test.dao.js` ejecuta la consulta SQL en MySQL.
7. El servidor responde con JSON o con un código de error.
8. La interfaz actualiza los resultados en la página.

## 5. Tecnologías utilizadas

- Node.js: entorno de ejecución del backend.
- Express: framework para crear la API y servir contenido estático.
- MySQL: base de datos relacional.
- mysql2: driver para conectar Node.js con MySQL.
- JavaScript (frontend): lógica del cliente para consumir la API.
- HTML: estructura de la interfaz de usuario.

## 6. Dependencias del proyecto

El archivo `package.json` incluye principalmente:

- `express` para el servidor web
- `mysql2` para la conexión con la base de datos

## 7. Requisitos para ejecutarlo

Para correr la aplicación correctamente, se necesita:

- Node.js instalado
- MySQL activo
- base de datos `test_db` creada
- tabla `test` con columnas como `id`, `name` y `birthdate`
- archivo de configuración de conexión válido en `env/mysqlConfig.js`

## 8. Inicio rápido

```bash
npm install
node server.js
```

Luego abrir en el navegador:

```text
http://localhost:5000
```

## 9. Conclusión

Es un ejemplo sencillo de una aplicación full-stack básica con backend en Node.js/Express y almacenamiento en MySQL, mostrando una separación clara entre:

- rutas,
- DAO,
- servicios,
- configuración,
- frontend estático.

Esto permite mantener la lógica ordenada y facilita expandir la app con más endpoints, validaciones y manejo de errores.