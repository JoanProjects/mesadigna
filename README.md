# 🍽️ MesaDigna — Sistema de Gestión de Comedor Comunitario

<div align="center">

![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server_2022-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Plataforma integral para la gestión de comedores comunitarios con inteligencia artificial integrada**

</div>

---

## 📋 Tabla de contenido

- [Descripción general](#-descripción-general)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y configuración](#-instalación-y-configuración)
  - [Opción A: Docker Compose (recomendado)](#opción-a-docker-compose-recomendado)
  - [Opción B: Desarrollo local](#opción-b-desarrollo-local)
- [Variables de entorno](#-variables-de-entorno)
- [API Reference](#-api-reference)
  - [Autenticación](#autenticación)
  - [Beneficiarios](#beneficiarios)
  - [Asistencias](#asistencias)
  - [Ingredientes](#ingredientes)
  - [Comidas](#comidas)
  - [Planes de cocina](#planes-de-cocina)
  - [Cocina (resúmenes)](#cocina-resúmenes)
  - [Predicciones IA](#predicciones-ia)
  - [Usuarios](#usuarios)
- [Roles y permisos](#-roles-y-permisos)
- [Módulo de predicción IA](#-módulo-de-predicción-ia)
- [Modelo de dominio](#-modelo-de-dominio)
- [Seeding de datos](#-seeding-de-datos)
- [Frontend](#-frontend)
- [Despliegue en producción](#-despliegue-en-producción)
- [Solución de problemas](#-solución-de-problemas)

---

## 📖 Descripción general

**MesaDigna** es una plataforma diseñada para digitalizar y optimizar la operación de comedores comunitarios. Permite gestionar el registro de beneficiarios, el control de asistencia diaria, la planificación de cocina, el inventario de ingredientes y genera predicciones inteligentes sobre la cantidad de porciones necesarias cada día usando un modelo de Machine Learning (Random Forest).

### Funcionalidades principales

| Módulo | Descripción |
|---|---|
| **Beneficiarios** | Registro completo con perfil de salud, restricciones dietéticas y código interno |
| **Asistencia** | Check-in diario por código interno, historial y resúmenes estadísticos |
| **Cocina** | Resumen diario, dietario, operacional e inventario de ingredientes |
| **Comidas** | Catálogo de comidas con ingredientes y porciones base |
| **Ingredientes** | Inventario con alertas de stock bajo |
| **Planes de cocina** | Planificación diaria de preparaciones por tipo de dieta |
| **Predicciones IA** | Estimación de porciones con Random Forest + fallback heurístico |
| **Usuarios** | Gestión de usuarios con 4 roles diferenciados |

---

## 🏛️ Arquitectura del sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                          │
│                   React 19 + TypeScript + Vite                   │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTPS :7001
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Backend API (.NET 10)                           │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Controllers │  │  Services    │  │  Middleware (JWT, Exc)  │  │
│  │  (REST API) │  │ (App Layer)  │  │                        │  │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────────┘  │
│         │                │                                        │
│  ┌──────▼──────────────────────────────────────────────────────┐ │
│  │              Repositorios / EF Core                          │ │
│  └──────────────────────────┬────────────────────────────────-─┘ │
└─────────────────────────────┼────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────────┐
              ▼               ▼                   ▼
   ┌──────────────────┐  ┌──────────┐  ┌─────────────────────┐
   │   SQL Server     │  │  Python  │  │   Fallback          │
   │   2022 (MSSQL)   │  │  FastAPI │  │   Heurístico        │
   │                  │  │  :8000   │  │   (sin microservicio)│
   └──────────────────┘  └──────────┘  └─────────────────────┘
                              │
                    ┌─────────────────┐
                    │  RandomForest   │
                    │  Regressor      │
                    │  (scikit-learn) │
                    └─────────────────┘
```

### Patrón de arquitectura

El backend implementa **Arquitectura Limpia** en tres capas:

```
BackEnd/
├── API/              → Controllers, Middleware, Program.cs
├── Application/      → Services, DTOs, Interfaces
├── Core/             → Entities, Enums, Repository Interfaces
└── Infrastructure/   → EF Core, Repositories, External Services
```

---

## 🛠️ Stack tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| .NET / ASP.NET Core | 10.0 | API REST principal |
| Entity Framework Core | 10.x | ORM + SQL Server |
| BCrypt.Net | latest | Hash de contraseñas |
| Microsoft.IdentityModel.Tokens | latest | JWT |
| Polly | latest | Resiliencia (Circuit Breaker + Retry) |
| DotNetEnv | latest | Variables de entorno |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5.x | Tipado estático |
| Vite | 6.x | Build tool |
| React Router | 7.x | Routing |
| Tailwind CSS | 4.x | Estilos |
| FontAwesome | 6.x | Iconos |
| Yup | latest | Validación de formularios |

### Microservicio Python
| Tecnología | Versión | Uso |
|---|---|---|
| FastAPI | 0.115.6 | API del microservicio |
| scikit-learn | 1.6.0 | Random Forest Regressor |
| numpy | 1.26.4 | Cálculos numéricos |
| pandas | 2.2.3 | Procesamiento de datos |
| joblib | 1.4.2 | Persistencia del modelo |
| uvicorn | 0.34.0 | Servidor ASGI |

---

## 📁 Estructura del proyecto

```
MesaDigna/
│
├── BackEnd/
│   ├── API/
│   │   ├── Controllers/
│   │   │   ├── AttendancesController.cs
│   │   │   ├── AuthController.cs
│   │   │   ├── BeneficiariesController.cs
│   │   │   ├── IngredientsController.cs
│   │   │   ├── KitchenController.cs
│   │   │   ├── KitchenPlansController.cs
│   │   │   ├── MealsController.cs
│   │   │   ├── PredictionsController.cs
│   │   │   └── UsersController.cs
│   │   ├── Middleware/
│   │   │   └── ExceptionHandlingMiddleware.cs
│   │   ├── .env                     ← Variables de entorno (no commitear)
│   │   └── Program.cs
│   │
│   ├── Application/
│   │   ├── DTOS/                    ← Request/Response DTOs
│   │   │   ├── Attendance/
│   │   │   ├── Auth/
│   │   │   ├── Beneficiary/
│   │   │   ├── Common/              ← ApiResponse, PagedResponse, etc.
│   │   │   ├── HealthProfile/
│   │   │   ├── Ingredient/
│   │   │   ├── Kitchen/
│   │   │   ├── KitchenPlan/
│   │   │   ├── Meal/
│   │   │   └── Prediction/
│   │   ├── Services/
│   │   │   ├── Interfaces/          ← Contratos de servicio
│   │   │   ├── AttendanceService.cs
│   │   │   ├── AuthService.cs
│   │   │   ├── BeneficiaryService.cs
│   │   │   ├── HealthProfileService.cs
│   │   │   ├── IngredientService.cs
│   │   │   ├── KitchenPlanService.cs
│   │   │   ├── KitchenService.cs
│   │   │   ├── MealService.cs
│   │   │   ├── PredictionOrchestrationService.cs
│   │   │   └── UserService.cs
│   │   └── DTOS/MappingExtensions.cs
│   │
│   ├── Core/
│   │   └── Domain/
│   │       ├── Common/
│   │       │   ├── BaseEntity.cs    ← Id, CreatedAt, UpdatedAt, IsActive
│   │       │   └── PagedResult.cs
│   │       ├── Entities/
│   │       │   ├── Attendance.cs
│   │       │   ├── Beneficiary.cs
│   │       │   ├── DailyKitchenPlan.cs
│   │       │   ├── HealthProfile.cs
│   │       │   ├── Ingredient.cs
│   │       │   ├── InventoryMovement.cs
│   │       │   ├── KitchenPreparation.cs
│   │       │   ├── Meal.cs
│   │       │   ├── MealIngredient.cs
│   │       │   ├── PortionPrediction.cs
│   │       │   ├── PredictionInputSnapshot.cs
│   │       │   └── User.cs
│   │       ├── Enums/
│   │       │   ├── BeneficiaryStatus.cs  (Activo, Inactivo, Suspendido)
│   │       │   ├── DietType.cs           (Normal, SinSal, Diabetica...)
│   │       │   ├── MealType.cs           (Desayuno, Almuerzo, Cena, Merienda)
│   │       │   ├── MovementType.cs       (Entrada, Salida, Ajuste, Merma)
│   │       │   ├── PreparationStatus.cs  (Planificada, EnPreparacion...)
│   │       │   ├── Sex.cs                (Masculino, Femenino, Otro)
│   │       │   ├── SpecialCondition.cs   [Flags] (Ninguna, AdultoMayor...)
│   │       │   ├── UnitOfMeasure.cs      (Unidad, Kilogramo, Gramo...)
│   │       │   └── UserRole.cs           (Administrador, Voluntario...)
│   │       ├── Exception/
│   │       │   └── ConflictException.cs
│   │       └── Interfaces/Repositories/  ← Contratos de repositorio
│   │
│   └── Infrastructure/
│       ├── Configurations/          ← EF Core Fluent API por entidad
│       ├── Data/
│       │   └── ApplicationDbContext.cs
│       ├── ExternalServices/
│       │   └── Prediction/
│       │       └── PythonPredictionService.cs
│       └── Repositories/
│           ├── BaseRepository.cs
│           ├── AttendanceRepository.cs
│           ├── BeneficiaryRepository.cs
│           ├── DailyKitchenPlanRepository.cs
│           ├── HealthProfileRepository.cs
│           ├── IngredientRepository.cs
│           ├── MealRepository.cs
│           └── UserRepository.cs
│
├── FrontEnd/
│   └── mesa-digna-app/
│       └── src/
│           ├── app/
│           │   ├── layouts/MainLayout.tsx
│           │   ├── providers/
│           │   │   ├── AuthProvider.tsx
│           │   │   └── NotificationProvider.tsx
│           │   └── router/
│           │       ├── index.tsx
│           │       ├── ProtectedRoute.tsx
│           │       └── RoleRoute.tsx
│           ├── components/
│           │   ├── feedback/       ← ConfirmDialog, ErrorBoundary, Toast
│           │   ├── shared/         ← PageHeader, StatsCard, HasRole
│           │   └── ui/             ← Button, Card, Input, Modal, etc.
│           ├── constants/          ← roles, routes, options
│           ├── features/
│           │   ├── attendances/
│           │   ├── auth/
│           │   ├── beneficiaries/
│           │   ├── dashboard/
│           │   ├── health-profiles/
│           │   ├── ingredients/
│           │   ├── kitchen/
│           │   ├── meals/
│           │   ├── predictions/
│           │   ├── profile/
│           │   └── users/
│           ├── hooks/              ← useForm, useDebounce, usePageTitle
│           ├── services/http/      ← client.ts, errors.ts, types.ts
│           └── utils/              ← cn, formatDate, formErrors, roles
│
├── PredictionService/
│   └── app/
│       ├── ml/
│       │   ├── data_generator.py   ← Datos simulados de entrenamiento
│       │   └── model.py            ← RandomForestRegressor
│       ├── models/
│       │   ├── requests.py         ← Pydantic request models
│       │   └── responses.py        ← Pydantic response models
│       ├── routes/
│       │   ├── health.py
│       │   └── prediction.py
│       ├── services/
│       │   └── prediction_service.py
│       ├── main.py
│       ├── Dockerfile
│       ├── docker-compose.yml
│       └── requirements.txt
│
├── Dockerfile                      ← Backend .NET
├── docker-compose.yml              ← Orquestación completa
├── .dockerignore
└── seed_mesadigna.py               ← Script de datos de prueba
```

---

## 📦 Requisitos previos

| Herramienta | Versión mínima | Necesaria para |
|---|---|---|
| Docker Desktop | 4.x | Despliegue con Compose |
| Docker Compose | 2.x | Orquestación |
| .NET SDK | 10.0 | Desarrollo backend |
| Node.js | 20.x | Desarrollo frontend |
| Python | 3.12 | Microservicio IA |
| SQL Server | 2022 | Base de datos (o via Docker) |

---

## 🚀 Instalación y configuración

### Opción A: Docker Compose (recomendado)

Esta opción levanta **todo el sistema** (SQL Server, backend .NET, microservicio Python) con un solo comando.

**1. Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/mesa-digna.git
cd mesa-digna
```

**2. Crear el archivo `.env` del backend**

```bash
cp BackEnd/API/.env.example BackEnd/API/.env
```

Editar `BackEnd/API/.env`:

```env
# Base de datos
DB_SERVER=sqlserver
DB_DATABASE=MesaDignaDb
DB_USER=sa
DB_PASSWORD=

# JWT
Jwt__Key=TuClaveSecretaDeAlMenos32Caracteres!!
Jwt__Issuer=MesaDignaAPI
Jwt__Audience=MesaDignaClient
Jwt__ExpirationInMinutes=1440

# Microservicio de predicción
PredictionService__BaseUrl=http://prediction-service:8000
```

**3. Levantar todos los servicios**

```bash
docker compose up -d --build
```

El primer build puede tardar varios minutos. Puedes ver el progreso con:

```bash
docker compose logs -f
```

**4. Aplicar migraciones de base de datos**

```bash
docker compose exec backend dotnet ef database update --project BackEnd/Infrastructure --startup-project BackEnd/API
```

O si usas las migraciones desde el host:

```bash
cd BackEnd/API
dotnet ef database update
```

**5. Verificar que todo está corriendo**

```bash
# Backend API
curl -k https://localhost:7001/health

# Microservicio Python
curl http://localhost:8000/health

# SQL Server
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "slifer@Klk2020" -Q "SELECT @@VERSION" -No
```

**6. Levantar el frontend**

```bash
cd FrontEnd/mesa-digna-app
npm install
npm run dev
```

El frontend quedará disponible en `http://localhost:5173`.

---

### Opción B: Desarrollo local

#### Backend (.NET)

**1. Instalar SQL Server** (o usar la instancia Docker solo del DB):

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=" \
  -p 1433:1433 --name mesadigna-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

**2. Configurar variables de entorno**

Crear `BackEnd/API/.env`:

```env
DB_SERVER=localhost
DB_DATABASE=MesaDignaDb
DB_USER=sa
DB_PASSWORD=
Jwt__Key=TuClaveSecretaDeAlMenos32Caracteres!!
Jwt__Issuer=MesaDignaAPI
Jwt__Audience=MesaDignaClient
Jwt__ExpirationInMinutes=1440
PredictionService__BaseUrl=http://localhost:8000
```

**3. Aplicar migraciones y correr**

```bash
cd BackEnd/API
dotnet ef database update
dotnet run
```

La API quedará en `https://localhost:7001`.

#### Microservicio Python

```bash
cd PredictionService/app
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Al iniciar por primera vez, el modelo se entrena automáticamente con datos simulados y se guarda en `app/ml/trained_model.joblib`.

#### Frontend

```bash
cd FrontEnd/mesa-digna-app
npm install
npm run dev
```

---

## 🔧 Variables de entorno

### Backend (`BackEnd/API/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_SERVER` | Host del SQL Server | `localhost` o `sqlserver` (Docker) |
| `DB_DATABASE` | Nombre de la base de datos | `MesaDignaDb` |
| `DB_USER` | Usuario SQL | `sa` |
| `DB_PASSWORD` | Contraseña SQL | `slifer@Klk2020` |
| `Jwt__Key` | Clave secreta JWT (mín. 32 chars) | `MiClaveSuperSecreta2024!!` |
| `Jwt__Issuer` | Emisor del token | `MesaDignaAPI` |
| `Jwt__Audience` | Audiencia del token | `MesaDignaClient` |
| `Jwt__ExpirationInMinutes` | Expiración del JWT | `1440` (24 horas) |
| `PredictionService__BaseUrl` | URL del microservicio Python | `http://localhost:8000` |

### Frontend (`FrontEnd/mesa-digna-app/.env`)

El frontend usa una URL base hardcodeada en `src/services/http/client.ts`. Para cambiarla en producción, modificar:

```typescript
const BASE_URL = 'https://tu-dominio.com/api';
```

---

## 📡 API Reference

Todos los endpoints (excepto `/api/auth/login`) requieren el header:

```
Authorization: Bearer <jwt_token>
```

La respuesta siempre sigue el formato:

```json
{
  "success": true,
  "message": "Operación exitosa.",
  "data": { ... },
  "errors": null,
  "fieldErrors": null
}
```

---

### Autenticación

#### `POST /api/auth/login`

Obtiene un JWT. No requiere autenticación.

```json
// Request
{
  "email": "admin@mesadigna.com",
  "password": "Admin1234!"
}

// Response 200
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2025-04-12T10:00:00Z",
    "user": {
      "id": 1,
      "fullName": "Admin Usuario",
      "email": "admin@mesadigna.com",
      "role": "Administrador",
      "isActive": true
    }
  }
}
```

#### `GET /api/auth/me`

Devuelve el usuario autenticado actual.

#### `PUT /api/auth/me`

Actualiza nombre, apellido, email y teléfono del usuario actual.

#### `POST /api/auth/change-password`

```json
{
  "currentPassword": "Admin1234!",
  "newPassword": "NuevaPass2024!"
}
```

---

### Beneficiarios

**Roles permitidos:** Administrador, Recepcionista (CRUD) / Voluntario (solo lectura)

#### `POST /api/beneficiaries`

```json
// Request
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "dateOfBirth": "1985-03-15T00:00:00",
  "sex": "Masculino",
  "identityDocument": "00112345678",  // Obligatorio si edad >= 18, exactamente 11 dígitos
  "phoneNumber": "8091234567",
  "address": "Calle 1, Santo Domingo",
  "emergencyContact": "María Pérez — 8097654321",
  "notes": "Beneficiario regular"
}
```

> **Regla de negocio:** Si el beneficiario es mayor de 18 años, `identityDocument` es **obligatorio** y debe tener exactamente **11 dígitos**. Para menores es opcional.

#### `GET /api/beneficiaries`

Soporta paginación y filtros via query params:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `page` | int | Página (default: 1) |
| `pageSize` | int | Tamaño (max: 50, default: 10) |
| `search` | string | Busca por nombre, apellido, código o cédula |
| `status` | string | `Activo`, `Inactivo`, `Suspendido` |

#### `GET /api/beneficiaries/{id}`

#### `PUT /api/beneficiaries/{id}`

Igual que POST pero incluye el campo `status`.

#### `DELETE /api/beneficiaries/{id}`

Desactiva (soft delete) el beneficiario.

#### `PATCH /api/beneficiaries/{id}/reactivate`

Reactiva un beneficiario desactivado.

#### `GET /api/beneficiaries/{id}/health-profile`

#### `PUT /api/beneficiaries/{id}/health-profile`

Crea o actualiza el perfil de salud (upsert):

```json
{
  "medicalConditions": "Hipertensión arterial",
  "dietaryRestrictions": "Dieta baja en sodio",
  "allergies": "Mariscos",
  "hasHypertension": true,
  "hasDiabetes": false,
  "specialConditions": 1,       // Flags: 0=Ninguna, 1=AdultoMayor, 2=Menor, 4=Embarazada, 8=Lactancia, 16=Discapacidad
  "nutritionalNotes": "Porciones moderadas",
  "additionalNotes": null
}
```

---

### Asistencias

**Roles permitidos:** Administrador, Recepcionista, Voluntario

#### `POST /api/attendances/check-in`

Registra la asistencia del día actual (UTC). Solo se puede hacer **un check-in por beneficiario por día**.

```json
// Opción A: por ID
{
  "beneficiaryId": 5,
  "checkInMethod": "Manual",
  "notes": null
}

// Opción B: por código interno
{
  "internalCode": "MD-12345",
  "checkInMethod": "CodigoInterno",
  "notes": "Llegó puntual"
}
```

> `checkInMethod` tiene máximo 20 caracteres. Valores sugeridos: `Manual`, `CodigoInterno`, `Tarjeta`, `Biometrico`.

#### `GET /api/attendances/by-date?date=2025-04-11`

Lista todas las asistencias de una fecha específica.

#### `GET /api/attendances/by-range?from=2025-04-01&to=2025-04-11`

Lista asistencias en un rango de fechas.

#### `GET /api/attendances/summary-daily?date=2025-04-11`

Resumen estadístico del día: total de asistentes, por sexo, menores, adultos mayores y con restricciones dietéticas.

---

### Ingredientes

**Roles permitidos:** Administrador, Cocinero

#### `POST /api/ingredients`

```json
{
  "name": "Arroz blanco",
  "description": "Arroz grano largo",
  "unitOfMeasure": "Kilogramo",
  "stockQuantity": 50.0,
  "minimumStock": 10.0
}
```

**Valores válidos de `unitOfMeasure`:** `Unidad`, `Kilogramo`, `Gramo`, `Litro`, `Mililitro`, `Libra`, `Onza`, `Taza`, `Cucharada`, `Cucharadita`

#### `GET /api/ingredients?page=1&pageSize=10&search=arroz`

#### `GET /api/ingredients/{id}`

#### `PUT /api/ingredients/{id}`

#### `PUT /api/ingredients/{id}/change-status`

Activa o desactiva el ingrediente. No se puede desactivar si está siendo usado en alguna comida (devuelve `409 Conflict`).

---

### Comidas

**Roles permitidos:** Administrador, Cocinero

#### `POST /api/meals`

```json
{
  "name": "Arroz con habichuelas",
  "description": "Plato principal dominicano",
  "mealType": "Almuerzo",
  "baseServings": 50
}
```

**Valores válidos de `mealType`:** `Desayuno`, `Almuerzo`, `Cena`, `Merienda`

#### `GET /api/meals?page=1&pageSize=10&search=arroz`

#### `GET /api/meals/{id}`

Incluye la lista de ingredientes asociados.

#### `PUT /api/meals/{id}`

#### `POST /api/meals/{id}/ingredients`

Asocia un ingrediente a la comida:

```json
{
  "ingredientId": 3,
  "quantityPerServing": 0.25,
  "unitOfMeasure": "Kilogramo"
}
```

> La combinación `mealId + ingredientId` es única. Retorna `409` si ya existe.

#### `DELETE /api/meals/{id}/ingredients/{ingredientId}`

---

### Planes de cocina

**Roles permitidos:** Administrador, Cocinero

#### `POST /api/kitchenplans`

```json
{
  "planDate": "2025-04-12",
  "mealType": "Almuerzo",
  "estimatedBeneficiaries": 80,
  "estimatedServings": 88,
  "notes": "Plan del viernes"
}
```

> La combinación `planDate + mealType` es única por día.

#### `GET /api/kitchenplans?page=1&pageSize=10`

#### `GET /api/kitchenplans/{id}`

#### `GET /api/kitchenplans/by-date?date=2025-04-12`

#### `POST /api/kitchenplans/preparations`

Agrega una preparación a un plan existente:

```json
{
  "dailyKitchenPlanId": 1,
  "mealId": 3,
  "dietType": "Normal",
  "estimatedServings": 60,
  "notes": null
}
```

**Valores válidos de `dietType`:** `Normal`, `SinSal`, `Diabetica`, `BajaEnAzucar`, `AdultoMayor`, `Hipoalergenica`, `BajaEnGrasa`

---

### Cocina (resúmenes)

**Roles permitidos:** Administrador, Cocinero

#### `GET /api/kitchen/daily-summary?date=2025-04-11`

Resumen de porciones del día por categoría dietética (hipertensión, diabetes, alergias, restricciones).

#### `GET /api/kitchen/diet-category/{categoryKey}/beneficiaries?date=2025-04-11&page=1&pageSize=50`

Lista los beneficiarios de una categoría específica que asistieron en esa fecha.

**Valores válidos de `categoryKey`:** `hypertension`, `diabetes`, `allergies`, `dietary_restrictions`

#### `GET /api/kitchen/dietary-summary?page=1&pageSize=10&startDate=2025-04-01&endDate=2025-04-11&search=juan`

#### `GET /api/kitchen/ingredients-summary`

Resumen de inventario: total de ingredientes y listado de los que tienen stock bajo.

#### `GET /api/kitchen/daily-operational-summary?date=2025-04-11`

Detalle operacional: asistentes, preparaciones planificadas y requerimientos de ingredientes.

#### `GET /api/kitchen/recommended-portions?date=2025-04-11`

Obtiene la predicción más reciente o genera una nueva automáticamente.

#### `PUT /api/kitchen/actual-portions?date=2025-04-11`

```json
{
  "actualPortionsPrepared": 85,
  "wastedPortions": 5
}
```

---

### Predicciones IA

**Roles permitidos:** Solo Administrador

#### `POST /api/predictions/generate`

```json
{
  "targetDate": "2025-04-12"
}
```

Genera una predicción de porciones para la fecha indicada. Usa el microservicio Python; si no está disponible, aplica el fallback heurístico automáticamente.

#### `GET /api/predictions/by-date?date=2025-04-12`

#### `GET /api/predictions/latest?date=2025-04-12`

#### `PUT /api/predictions/actual-attendance?date=2025-04-12&count=78`

Registra la asistencia real del día para calcular la precisión del modelo.

#### `PUT /api/predictions/actual-portions?date=2025-04-12`

```json
{
  "actualPortionsPrepared": 85,
  "wastedPortions": 3
}
```

#### `GET /api/predictions/accuracy-history?days=30`

Historial de precisión del modelo en los últimos N días.

#### `GET /api/predictions/model-info`

Información del modelo activo: nombre, versión, features, importancias y métricas.

#### `POST /api/predictions/retrain`

Reentrena el modelo con datos históricos reales. Requiere mínimo 30 predicciones con asistencia real registrada.

```json
{
  "fromDate": "2025-01-01",
  "toDate": "2025-04-01"
}
```

---

### Usuarios

**Roles permitidos:** Solo Administrador

#### `GET /api/users?page=1&pageSize=10&isActive=true`

#### `GET /api/users/{id}`

#### `POST /api/users`

```json
{
  "firstName": "María",
  "lastName": "González",
  "email": "maria@mesadigna.com",
  "password": "Pass1234!",
  "role": "Recepcionista",
  "phoneNumber": "8091234567"
}
```

**Valores válidos de `role`:** `Administrador`, `Voluntario`, `Cocinero`, `Recepcionista`

#### `PUT /api/users/{id}`

#### `PATCH /api/users/{id}/status`

```json
{ "isActive": false }
```

#### `PATCH /api/users/{id}/role`

```json
{ "role": "Cocinero" }
```

---

## 👥 Roles y permisos

| Endpoint / Acción | Administrador | Recepcionista | Voluntario | Cocinero |
|---|:---:|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ | ✅ |
| Ver / editar perfil propio | ✅ | ✅ | ✅ | ✅ |
| Crear / editar beneficiarios | ✅ | ✅ | ❌ | ❌ |
| Ver beneficiarios | ✅ | ✅ | ✅ | ❌ |
| Check-in asistencia | ✅ | ✅ | ✅ | ❌ |
| Ingredientes (CRUD) | ✅ | ❌ | ❌ | ✅ |
| Comidas (CRUD) | ✅ | ❌ | ❌ | ✅ |
| Planes de cocina | ✅ | ❌ | ❌ | ✅ |
| Resúmenes de cocina | ✅ | ❌ | ❌ | ✅ |
| Predicciones IA | ✅ | ❌ | ❌ | ❌ |
| Gestión de usuarios | ✅ | ❌ | ❌ | ❌ |

---

## 🤖 Módulo de predicción IA

### Cómo funciona

El sistema usa un **RandomForestRegressor** de scikit-learn para predecir la cantidad de porciones necesarias cada día.

**Features del modelo (13 variables):**

| Feature | Descripción |
|---|---|
| `day_of_week` | Día de la semana (0=Lunes, 6=Domingo) |
| `total_beneficiaries` | Total de beneficiarios activos |
| `elderly_count` | Cantidad de adultos mayores (≥65 años) |
| `minors_count` | Cantidad de menores (< 18 años) |
| `dietary_restrictions_count` | Beneficiarios con restricciones + alergias |
| `hypertension_count` | Beneficiarios con hipertensión |
| `diabetes_count` | Beneficiarios con diabetes |
| `previous_day_attendance` | Asistencia del día anterior |
| `attendance_last_7_days_avg` | Promedio de asistencia últimos 7 días |
| `attendance_last_30_days_avg` | Promedio de asistencia últimos 30 días |
| `is_weekend` | 1 si es fin de semana, 0 si no |
| `attendance_trend` | avg_7 - avg_30 (tendencia) |
| `beneficiary_attendance_ratio` | avg_30 / total_beneficiaries |

### Flujo de predicción

```
Backend recibe petición de predicción
        │
        ▼
Recopila datos del sistema (beneficiarios activos, historial, perfiles de salud)
        │
        ▼
Envía al microservicio Python (timeout: 5s, retry: 2 veces)
        │
   ┌────┴────┐
   │         │
   ✅ OK    ❌ Falla (timeout/error)
   │         │
   │         ▼
   │   Fallback heurístico:
   │   porción = avg_7 o avg_30 × 1.10
   │   (reducción 30% en fines de semana)
   │         │
   └────┬────┘
        │
        ▼
Aplica margen de seguridad (+10%)
Calcula distribución por tipo de dieta
Persiste predicción con InputSnapshot
        │
        ▼
Devuelve PortionPredictionResponseDto
```

### Entrenamiento inicial

Al arrancar por primera vez, si no existe el archivo `trained_model.joblib`, el microservicio genera automáticamente **2,000 registros simulados** con patrones realistas y entrena el modelo.

### Reentrenamiento con datos reales

Una vez que el sistema tiene al menos **30 días de asistencia real** registrada, se puede reentrenar con datos históricos reales desde `POST /api/predictions/retrain`. Los datos de entrenamiento se construyen desde los `PredictionInputSnapshot` almacenados junto a cada predicción.

### Confianza del modelo

La confianza reportada mide la concordancia entre los 200 árboles del RandomForest para esa predicción específica:

```
cv = std_dev(predicciones_árboles) / media(predicciones_árboles)
confidence = max(0, 1 - cv)
```

Un valor cercano a 1.0 indica alta concordancia entre árboles (predicción confiable). Un valor bajo indica alta dispersión (datos fuera de distribución o patrón inusual).

---

## 🗄️ Modelo de dominio

### Entidades principales

```
User
├── Id, FirstName, LastName, Email, PasswordHash
├── Role (Administrador | Voluntario | Cocinero | Recepcionista)
└── IsActive, LastLoginAt

Beneficiary
├── Id, InternalCode (MD-XXXXX, auto-generado)
├── FirstName, LastName, DateOfBirth, Sex
├── IdentityDocument (11 dígitos, obligatorio si ≥18 años)
├── Status (Activo | Inactivo | Suspendido)
├── HealthProfile (1:1, opcional)
└── Attendances (1:N)

HealthProfile
├── BeneficiaryId (FK, unique)
├── MedicalConditions, DietaryRestrictions, Allergies
├── HasHypertension, HasDiabetes
├── SpecialConditions (Flags: Ninguna|AdultoMayor|Menor|Embarazada|Lactancia|Discapacidad)
└── HasDietaryConsiderations (computed property)

Attendance
├── BeneficiaryId (FK)
├── ServiceDate (DateOnly) ← fecha UTC del servidor
├── CheckInTime (DateTime)
└── Constraint: UNIQUE(BeneficiaryId, ServiceDate)

Ingredient
├── Name (unique), UnitOfMeasure, StockQuantity, MinimumStock
├── IsLowStock (computed: StockQuantity <= MinimumStock)
└── MealIngredients (N:M con Meal)

Meal
├── Name (unique), MealType, BaseServings
└── MealIngredients → Ingredient (con QuantityPerServing)

DailyKitchenPlan
├── PlanDate, MealType ← UNIQUE juntos
├── EstimatedBeneficiaries, EstimatedServings
└── Preparations → KitchenPreparation (1:N)

KitchenPreparation
├── DailyKitchenPlanId (FK), MealId (FK)
├── DietType, EstimatedServings, ActualServings
└── Status (Planificada|EnPreparacion|Completada|Cancelada)

PortionPrediction
├── PredictionDate, RecommendedPortions
├── RegularPortions, SpecialDietPortions
├── ModelConfidence, ModelName, ModelVersion
├── ActualAttendance, AccuracyScore (llenados post-día)
└── InputSnapshot → PredictionInputSnapshot (1:1)
```

### Query Filters activos (soft delete)

Las siguientes entidades tienen `HasQueryFilter(e => e.IsActive)` en EF Core, lo que significa que las consultas normales **solo devuelven registros activos** automáticamente:

- `User`
- `Beneficiary`
- `Ingredient`
- `Meal`
- `PortionPrediction`

Para acceder a registros inactivos (por ejemplo al reactivar), se usa `IgnoreQueryFilters()` en los repositorios.

---

## 🌱 Seeding de datos

El repositorio incluye `seed_mesadigna.py` para poblar la base de datos con datos de prueba realistas. Requiere tener la API corriendo.

### Instalación

```bash
pip install requests
```

### Configuración

Editar las primeras líneas de `seed_mesadigna.py`:

```python
BASE_URL       = "https://localhost:7001"
LOGIN_EMAIL    = "admin@mesadigna.com"
LOGIN_PASSWORD = "Admin1234!"

N_BENEFICIARIOS = 120
N_INGREDIENTES  = 32
N_COMIDAS       = 20
N_PLANES        = 14
N_ASISTENCIAS   = 80
```

### Ejecución

```bash
python seed_mesadigna.py
```

### Qué inserta el seeder

| Entidad | Cantidad | Notas |
|---|---|---|
| Ingredientes | 32 | Nombres únicos de productos dominicanos |
| Comidas | 20 | Platos típicos con su tipo (Almuerzo, Desayuno, etc.) |
| Relaciones comida-ingrediente | ~60-100 | 2-5 ingredientes por comida |
| Beneficiarios | 120 | 60% adultos, 25% mayores, 15% menores |
| Perfiles de salud | 120 | Con HTA/DM correlacionados por edad |
| Planes de cocina | 14 | Uno por fecha/tipo, con preparaciones |
| Asistencias | 80 | Solo para el día actual (UTC) |

> **Nota:** El seeder maneja automáticamente todos los `[SKIP]` por conflictos (duplicados) sin abortar. Si se corre dos veces, inserta solo lo que falta.

---

## 🖥️ Frontend

### Páginas disponibles

| Ruta | Descripción | Roles |
|---|---|---|
| `/login` | Inicio de sesión | Público |
| `/dashboard` | Resumen general con métricas | Todos |
| `/beneficiarios` | Lista paginada con filtros | Admin, Receptionist, Voluntario |
| `/beneficiarios/nuevo` | Formulario de creación | Admin, Receptionist |
| `/beneficiarios/:id` | Detalle + perfil de salud | Admin, Receptionist, Voluntario |
| `/beneficiarios/:id/editar` | Edición | Admin, Receptionist |
| `/beneficiarios/:id/salud` | Perfil de salud | Admin, Receptionist |
| `/asistencia/check-in` | Registro de asistencia | Admin, Receptionist, Voluntario |
| `/asistencia/historial` | Historial con filtros | Admin, Receptionist, Voluntario |
| `/cocina` | Resumen diario dietético | Admin, Cocinero |
| `/cocina/dietario` | Beneficiarios con restricciones | Admin, Cocinero |
| `/cocina/operacional` | Preparaciones e ingredientes | Admin, Cocinero |
| `/ingredientes` | Lista y gestión | Admin, Cocinero |
| `/comidas` | Catálogo de comidas | Admin, Cocinero |
| `/predicciones` | Predicciones IA | Solo Admin |
| `/usuarios` | Gestión de usuarios | Solo Admin |
| `/mi-perfil` | Perfil y cambio de contraseña | Todos |

### Acceso rápido a rutas

Todas las rutas están centralizadas en `src/constants/routes.ts`:

```typescript
import { ROUTES } from '@/constants/routes';

navigate(ROUTES.BENEFICIARY_DETAIL(id));
navigate(ROUTES.BENEFICIARY_EDIT(id));
```

### Sistema de notificaciones

Las notificaciones toast se manejan a través del `NotificationProvider`:

```typescript
const { success, error, warning, info } = useNotification();

success('Beneficiario creado correctamente.');
error('No se pudo conectar con el servidor.');
```

### Manejo de errores HTTP

El cliente HTTP (`src/services/http/client.ts`) maneja automáticamente:
- **401** → Limpia el token y redirige a `/login`
- **409** → Extrae `fieldErrors` para marcar campos específicos del formulario
- **Cualquier error de red** → Lanza `ApiError` con mensaje amigable

---

## 🐳 Despliegue en producción

### Con Docker Compose

**1. Variables de entorno de producción**

Cambiar en `docker-compose.yml` o usar un `.env` en la raíz:

```env
SA_PASSWORD=TuContraseñaSegura2024!
```

Y actualizar `BackEnd/API/.env`:

```env
Jwt__Key=ClaveDeProduccionSuperSegura2024!!
DB_PASSWORD=TuContraseñaSegura2024!
```

**2. Build y despliegue**

```bash
docker compose -f docker-compose.yml up -d --build
```

**3. Consideraciones de SSL**

El Dockerfile del backend genera un certificado autofirmado en el build. Para producción, se recomienda usar un reverse proxy (Nginx o Traefik) con certificados Let's Encrypt:

```nginx
server {
    listen 443 ssl;
    server_name tu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    location /api {
        proxy_pass http://localhost:7001;
    }
    
    location / {
        root /var/www/mesa-digna;
        try_files $uri /index.html;
    }
}
```

**4. Build del frontend para producción**

```bash
cd FrontEnd/mesa-digna-app
npm run build
# Los archivos quedan en dist/
```

---

## 🔧 Solución de problemas

### El seeder no puede conectarse

```
[ERROR] No se puede conectar a https://localhost:7001/api/auth/login
```

- Verificar que la API está corriendo: `docker compose ps` o `dotnet run`
- Verificar el puerto en `BASE_URL` del seeder
- Si usa HTTPS local, asegurarse que `VERIFY_SSL = False` en el seeder

### Error de SSL con requests en Python

El seeder ya incluye `VERIFY_SSL = False` para entornos de desarrollo con certificados autofirmados de Kestrel. Para producción cambiar a `True` o proveer la ruta al certificado.

### La API devuelve 400 al crear un beneficiario adulto sin cédula

Regla de negocio: todos los beneficiarios mayores de 18 años **deben** tener `identityDocument` con exactamente 11 dígitos. El seeder lo maneja automáticamente calculando la edad desde `dateOfBirth`.

### El microservicio Python no responde

La API tiene un fallback heurístico automático. Si el microservicio Python no está disponible:
- Las predicciones siguen funcionando con el fallback
- El modelo reportará `HeuristicFallback` como nombre
- La confianza será `0.5` (valor fijo del fallback)

Para levantar solo el microservicio:

```bash
docker compose up prediction-service -d
```

O localmente:

```bash
cd PredictionService/app
uvicorn app.main:app --port 8000
```

### Conflictos de unicidad en el seeder (409)

Son esperados y no son errores. El seeder los registra como `[SKIP]` y continúa. Si quieres datos completamente frescos, trunca las tablas antes de correr el seeder:

```sql
-- Orden correcto por FKs
DELETE FROM PredictionInputSnapshots;
DELETE FROM PortionPredictions;
DELETE FROM KitchenPreparations;
DELETE FROM DailyKitchenPlans;
DELETE FROM Attendances;
DELETE FROM HealthProfiles;
DELETE FROM Beneficiaries;
DELETE FROM MealIngredients;
DELETE FROM InventoryMovements;
DELETE FROM Meals;
DELETE FROM Ingredients;
```

### Errores de migración de EF Core

```bash
# Crear nueva migración
cd BackEnd/API
dotnet ef migrations add NombreDeLaMigracion --project ../Infrastructure

# Aplicar migraciones
dotnet ef database update

# Revertir última migración
dotnet ef database update NombreAnterior
```

### Ver logs de Docker en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo el backend
docker compose logs -f backend

# Solo el microservicio
docker compose logs -f prediction-service
```

---

## 📄 Licencia

Este proyecto fue desarrollado como proyecto final académico. Todos los derechos reservados.

---

<div align="center">
  <p>Desarrollado con ❤️ para los comedores comunitarios de República Dominicana</p>
  <p><strong>MesaDigna</strong> — 2025</p>
</div>
