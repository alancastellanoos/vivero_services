# 🌿 Vivero Services API (Backend)

API REST desarrollada con **Node.js, Express, y Sequelize (MariaDB)** para la gestión de un vivero de adopción de plantas. Permite a los usuarios donar plantas, buscar opciones de adopción, enviar solicitudes y mantener comunicación directa (chat) para concretar la entrega.

## 🚀 Características Principales

| Característica | Descripción |
| :--- | :--- |
| **Autenticación JWT** | Sistema seguro de registro e inicio de sesión. |
| **Gestión de Plantas** | CRUD completo para publicar plantas en adopción o en catálogo. Incluye subida de imágenes (`multer`). |
| **Solicitudes de Adopción** | Manejo del ciclo de vida de las solicitudes (`PENDING`, `ACCEPTED`, `REJECTED`). |
| **Mensajería (Chat)** | Comunicación directa y privada entre Donante y Solicitante. |
| **Búsqueda Avanzada** | Filtros por nombre, etiquetas (`Tags`), y estado de adopción/catálogo. |

---

## 🛠️ Stack Tecnológico

* **Lenguaje:** Node.js
* **Framework:** Express.js
* **Base de Datos:** MariaDB
* **ORM:** Sequelize
* **Autenticación:** JSON Web Tokens (JWT)
* **Archivos:** Multer (para subida de imágenes)
* **Documentación:** Swagger/OpenAPI 3.0

---
---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para levantar el proyecto en tu máquina local:

### 1. Clonar el Repositorio

Asegúrate de estar en la rama de desarrollo.

```bash
git clone [https://github.com/tu-usuario/vivero_services.git](https://github.com/tu-usuario/vivero_services.git)
cd vivero_services
npm install

# Configuración de Servidor
PORT=3000
SECRET_KEY=TU_CLAVE_SECRETA_JWT_FUERTE

# Configuración de Base de Datos (MariaDB)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=vivero_db
DB_PORT=

# Inicia la API. Sequelize sincronizará la DB.
npm run dev



