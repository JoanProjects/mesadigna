"""
MesaDigna — Script de inserción masiva de datos
================================================
Cubre todas las entidades (excepto Users) respetando:
  - Validaciones de DTOs
  - Relaciones entre entidades
  - Query filters (IsActive, soft-delete)
  - Unicidades (InternalCode, IdentityDocument, nombre de ingrediente/comida)
  - Regla de negocio: adultos (≥18 años) deben tener IdentityDocument de 11 dígitos
  - Regla de negocio: un beneficiario solo puede hacer check-in UNA VEZ por día
  - Regla de negocio: PlanDate+MealType único en DailyKitchenPlans
  - Regla de negocio: beneficiario debe estar Activo para check-in

Orden de inserción:
  1. Login → obtener JWT
  2. Ingredientes
  3. Comidas (Meals)
  4. MealIngredients
  5. Beneficiarios
  6. Perfiles de salud (HealthProfiles)
  7. Planes de cocina (DailyKitchenPlans)
  8. Preparaciones de cocina (KitchenPreparations)
  9. Asistencias (Attendances) — solo se puede insertar para HOY

Uso:
  pip install requests
  python seed_mesadigna.py

  Configurar BASE_URL, LOGIN_EMAIL y LOGIN_PASSWORD abajo.
"""

import requests
import random
import time
import sys
import warnings
from datetime import date, datetime, timedelta
from typing import Optional

# Suprimir el warning de certificado autofirmado en localhost
# (el certificado de desarrollo de .NET/Kestrel es self-signed)
from urllib3.exceptions import InsecureRequestWarning
warnings.filterwarnings("ignore", category=InsecureRequestWarning)

# ─────────────────────────────────────────────
# CONFIGURACIÓN — ajustar antes de correr
# ─────────────────────────────────────────────
BASE_URL = "https://localhost:7001"  # URL base de tu API .NET (ajustar puerto)
LOGIN_EMAIL    = ""
LOGIN_PASSWORD = ""

# Cuántos registros insertar de cada entidad
N_BENEFICIARIOS = 120
N_INGREDIENTES  = 32
N_COMIDAS       = 20
N_PLANES        = 14   # Planes de cocina (cada uno en una fecha distinta)
N_ASISTENCIAS   = 80   # Asistencias para HOY (máx = N_BENEFICIARIOS)

# Si True, imprime cada request/response para depuración
VERBOSE = False

# VERIFY_SSL: False para desarrollo local (certificado autofirmado de Kestrel)
# En producción cambiar a True o a la ruta del cert: "/ruta/al/cert.pem"
VERIFY_SSL = False
# ─────────────────────────────────────────────


# ── Helpers de HTTP ──────────────────────────────────────────────────────────

class ApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.token: Optional[str] = None
        self.session = requests.Session()
        self.session.verify = VERIFY_SSL  # ← deshabilitar verificación SSL en dev

    def _headers(self) -> dict:
        h = {"Content-Type": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    def login(self, email: str, password: str) -> bool:
        url = f"{self.base_url}/api/auth/login"
        body = {"email": email, "password": password}
        try:
            r = self.session.post(url, json=body, timeout=15)
        except requests.exceptions.SSLError as e:
            print(f"[ERROR] SSL: {e}")
            print("  → Verifica que VERIFY_SSL=False o apunta al cert correcto.")
            return False
        except requests.exceptions.ConnectionError:
            print(f"[ERROR] No se puede conectar a {url}")
            print("  → Asegúrate que la API está corriendo y el puerto es correcto.")
            print(f"  → Puerto actual configurado: {self.base_url}")
            return False
        if r.status_code == 200:
            data = r.json()
            self.token = data["data"]["token"]
            user = data["data"]["user"]
            print(f"[AUTH] Login OK — {user['fullName']} ({user['role']})")
            return True
        print(f"[ERROR] Login fallido: {r.status_code} {r.text}")
        return False

    def post(self, path: str, body: dict, label: str = "") -> Optional[dict]:
        url = f"{self.base_url}{path}"
        if VERBOSE:
            print(f"  POST {url} → {body}")
        try:
            r = self.session.post(url, json=body, headers=self._headers(), timeout=15)
        except Exception as e:
            print(f"  [ERR] {label}: {e}")
            return None
        if VERBOSE:
            print(f"  {r.status_code} {r.text[:300]}")
        if r.status_code in (200, 201):
            return r.json().get("data")
        # Conflicto esperado (duplicado) → no es error fatal
        if r.status_code == 409:
            print(f"  [SKIP] {label} — conflicto (ya existe): {r.json().get('message','')}")
            return None
        print(f"  [WARN] {label} → {r.status_code}: {r.text[:200]}")
        return None

    def put(self, path: str, body: dict, label: str = "") -> Optional[dict]:
        url = f"{self.base_url}{path}"
        if VERBOSE:
            print(f"  PUT {url} → {body}")
        try:
            r = self.session.put(url, json=body, headers=self._headers(), timeout=15)
        except Exception as e:
            print(f"  [ERR] {label}: {e}")
            return None
        if VERBOSE:
            print(f"  {r.status_code} {r.text[:300]}")
        if r.status_code in (200, 201):
            return r.json().get("data")
        print(f"  [WARN] {label} → {r.status_code}: {r.text[:200]}")
        return None


# ── Generadores de datos falsos ───────────────────────────────────────────────

# Catálogos de enums (valores string que acepta la API)
SEX_VALUES        = ["Masculino", "Femenino", "Otro"]
UNIT_OF_MEASURE   = ["Kilogramo", "Gramo", "Litro", "Mililitro", "Unidad", "Taza", "Cucharada"]
MEAL_TYPE_VALUES  = ["Desayuno", "Almuerzo", "Cena", "Merienda"]
DIET_TYPE_VALUES  = ["Normal", "SinSal", "Diabetica", "BajaEnAzucar", "AdultoMayor", "Hipoalergenica", "BajaEnGrasa"]
SPECIAL_CONDITION = [0, 1, 2, 4, 8, 16, 0, 0, 0]  # Ponderado hacia Ninguna (0)

PRIMEROS_NOMBRES = [
    "Carlos", "María", "José", "Ana", "Juan", "Rosa", "Pedro", "Carmen",
    "Luis", "Elena", "Miguel", "Isabel", "Ramón", "Laura", "Antonio",
    "Marta", "Rafael", "Sofía", "Andrés", "Patricia", "David", "Lucía",
    "Jorge", "Natalia", "Alberto", "Claudia", "Fernando", "Valeria",
    "Héctor", "Diana", "Ernesto", "Alicia", "Manuel", "Sandra", "Pablo",
    "Beatriz", "Alejandro", "Gabriela", "Ricardo", "Verónica",
    "Yolanda", "Félix", "Marisol", "Dario", "Esperanza", "Cesar", "Iris",
    "Rodrigo", "Leticia", "Omar", "Silvia", "Cristian", "Rebeca", "Iván",
    "Miriam", "Tomas", "Xiomara", "Germán", "Fabiola", "Winston", "Amelia",
    "Kelvin", "Rosario", "Brayan", "Eunice", "Jonathan", "Nury", "Wilmer",
    "Dilenia", "Elvin", "Yanira", "Joselin", "Damaris", "Adonis", "Yessica",
    "Starling", "Yomaira", "Darlin", "Senaida", "Hector", "Zoraida",
]

APELLIDOS = [
    "García", "Martínez", "López", "González", "Pérez", "Rodríguez",
    "Fernández", "Sánchez", "Romero", "Torres", "Flores", "Vargas",
    "Reyes", "Cruz", "Morales", "Ortiz", "Castillo", "Jiménez", "Herrera",
    "Medina", "Ramos", "Núñez", "Vega", "Santos", "Suárez", "De la Rosa",
    "Valdez", "Cabrera", "Pichardo", "Marte", "Cuevas", "Guerrero",
    "Espinal", "Taveras", "Féliz", "Almonte", "Tineo", "Clase", "Batista",
    "Rosario", "Santana", "Polanco", "Disla", "Peralta", "Bautista",
    "Agramonte", "Peña", "Comprés", "Montero", "Lora", "Antigua",
    "Salcedo", "Abreu", "Lugo", "Nina", "Féliz", "Ogando", "Roque",
    "Castañeda", "Fernández", "Adames", "Minyety", "Mella", "Comprés",
    "Infante", "Payano", "Cuello", "Ureña", "Díaz", "Baez", "Recio",
    "Soto", "Mieses", "Guerrero", "De Oleo", "Burgos", "Nin", "Calcaño",
]

INGREDIENTE_NOMBRES = [
    "Arroz blanco", "Habichuelas rojas", "Pollo entero", "Carne de res molida",
    "Aceite vegetal", "Sal de mesa", "Cebolla blanca", "Ajo fresco", "Tomate",
    "Pimiento rojo", "Zanahoria", "Papa criolla", "Plátano verde", "Yuca",
    "Maíz amarillo", "Leche entera", "Huevos frescos", "Mantequilla",
    "Harina de trigo", "Azúcar blanca", "Pasta corta", "Atún en lata",
    "Queso blanco", "Aguacate", "Cilantro fresco", "Orégano seco", "Comino",
    "Auyama", "Berenjenas", "Habas secas", "Lentejas", "Garbanzos",
    "Salami dominicano", "Longaniza", "Pescado fresco", "Camarones",
    "Habichuelas negras", "Espagueti", "Apio", "Lechuga",
    "Pepino", "Remolacha", "Vinagre", "Limón", "Naranja agria",
    "Tomillo", "Laurel", "Pimienta negra", "Canela", "Vainilla",
    "Leche de coco", "Batata", "Ñame", "Plátano maduro",
]

COMIDA_NOMBRES = [
    "Arroz blanco con habichuelas",
    "Pollo guisado dominicano",
    "Carne molida con papas",
    "Sancocho de pollo",
    "Tostones con carne",
    "Pasta con salsa de tomate",
    "Arroz con leche",
    "Ensalada de vegetales frescos",
    "Mangú con salami",
    "Yuca con cebolla encurtida",
    "Sopón de pollo",
    "Hervido de res",
    "Locrio de pollo",
    "Pescado en caldo",
    "Habichuelas guisadas con longaniza",
    "Espagueti a la dominicana",
    "Auyama guisada",
    "Arroz con pollo",
    "Ensalada de remolacha",
    "Batata sancochada con mantequilla",
    "Caldo de res",
    "Pollo al horno con vegetales",
    "Ensalada de papa",
    "Plátano maduro horneado",
    "Lentejas guisadas",
]

CONDICIONES_MEDICAS = [
    "Hipertensión arterial",
    "Diabetes tipo 2",
    "Artritis reumatoide",
    "Asma bronquial",
    "Insuficiencia renal leve",
    "Gastritis crónica",
    "Enfermedad cardiovascular leve",
    "Obesidad",
    "Colesterol alto",
    "Anemia ferropénica",
    None, None, None, None, None, None,  # mayoría sin condición
]

ALERGIAS = [
    "Mariscos", "Nueces", "Lactosa", "Gluten", "Huevo",
    "Cacahuetes", "Soya", "Pescado", "Frutos secos",
    None, None, None, None, None, None, None, None,
]

RESTRICCIONES = [
    "Dieta baja en sodio",
    "Dieta baja en azúcar",
    "Sin gluten",
    "Sin lácteos",
    "Dieta blanda",
    "Baja en grasas saturadas",
    "Alta en fibra",
    "Sin picante",
    "Baja en potasio",
    "Dieta para insuficiencia renal",
    None, None, None, None, None, None,
]

_used_cedulas: set = set()
_used_phones:  set = set()


def random_cedula() -> str:
    """Genera una cédula dominicana falsa de exactamente 11 dígitos, única."""
    while True:
        c = "".join([str(random.randint(0, 9)) for _ in range(11)])
        if c not in _used_cedulas:
            _used_cedulas.add(c)
            return c


def random_phone() -> str:
    """Genera número de teléfono dominicano falso y único."""
    while True:
        p = f"809{random.randint(1000000, 9999999)}"
        if p not in _used_phones:
            _used_phones.add(p)
            return p


def random_dob_adult() -> str:
    """Fecha de nacimiento para adulto (18–80 años)."""
    today = date.today()
    years = random.randint(18, 80)
    months = random.randint(0, 11)
    days = random.randint(0, 27)
    dob = today.replace(year=today.year - years)
    dob = dob - timedelta(days=months * 30 + days)
    return dob.isoformat() + "T00:00:00"


def random_dob_minor() -> str:
    """Fecha de nacimiento para menor (5–17 años)."""
    today = date.today()
    years = random.randint(5, 17)
    months = random.randint(0, 11)
    dob = today.replace(year=today.year - years) - timedelta(days=months * 30)
    return dob.isoformat() + "T00:00:00"


def random_dob_elder() -> str:
    """Fecha de nacimiento para adulto mayor (65–90 años)."""
    today = date.today()
    years = random.randint(65, 90)
    months = random.randint(0, 11)
    dob = today.replace(year=today.year - years) - timedelta(days=months * 30)
    return dob.isoformat() + "T00:00:00"


def age_from_dob(dob_iso: str) -> int:
    dob = datetime.fromisoformat(dob_iso.replace("T00:00:00", "")).date()
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


# ── Sección 1: Ingredientes ───────────────────────────────────────────────────

def seed_ingredientes(api: ApiClient) -> list[dict]:
    """
    POST /api/ingredients
    Rol: Administrador o Cocinero
    Validaciones:
      - Name: requerido, max 150, único
      - UnitOfMeasure: enum válido (string)
      - StockQuantity >= 0
      - MinimumStock >= 0
    """
    print("\n[1/7] Insertando ingredientes...")
    ingredientes = []
    nombres_disponibles = INGREDIENTE_NOMBRES.copy()
    random.shuffle(nombres_disponibles)

    for i in range(min(N_INGREDIENTES, len(nombres_disponibles))):
        nombre = nombres_disponibles[i]
        unit   = random.choice(UNIT_OF_MEASURE)
        stock  = round(random.uniform(5.0, 100.0), 2)
        min_st = round(random.uniform(1.0, 10.0), 2)

        body = {
            "name":          nombre,
            "description":   f"Ingrediente base: {nombre.lower()}",
            "unitOfMeasure": unit,
            "stockQuantity": stock,
            "minimumStock":  min_st,
        }
        data = api.post("/api/ingredients", body, label=nombre)
        if data:
            ingredientes.append(data)
            print(f"  ✓ Ingrediente: {data['name']} (id={data['id']})")
        time.sleep(0.05)

    print(f"  → {len(ingredientes)} ingredientes creados.")
    return ingredientes


# ── Sección 2: Comidas (Meals) ────────────────────────────────────────────────

def seed_comidas(api: ApiClient) -> list[dict]:
    """
    POST /api/meals
    Rol: Administrador o Cocinero
    Validaciones:
      - Name: requerido, max 200, único
      - MealType: enum válido
      - BaseServings >= 1
    """
    print("\n[2/7] Insertando comidas...")
    comidas = []
    nombres = random.sample(COMIDA_NOMBRES, min(N_COMIDAS, len(COMIDA_NOMBRES)))

    for nombre in nombres:
        meal_type = random.choice(MEAL_TYPE_VALUES)
        servings  = random.randint(10, 100)

        body = {
            "name":         nombre,
            "description":  f"Preparación tradicional: {nombre.lower()}",
            "mealType":     meal_type,
            "baseServings": servings,
        }
        data = api.post("/api/meals", body, label=nombre)
        if data:
            comidas.append(data)
            print(f"  ✓ Comida: {data['name']} (id={data['id']}, tipo={data['mealType']})")
        time.sleep(0.05)

    print(f"  → {len(comidas)} comidas creadas.")
    return comidas


# ── Sección 3: MealIngredients ────────────────────────────────────────────────

def seed_meal_ingredients(api: ApiClient, comidas: list[dict], ingredientes: list[dict]):
    """
    POST /api/meals/{id}/ingredients
    Rol: Administrador o Cocinero
    Validaciones:
      - IngredientId: debe existir y ser activo
      - QuantityPerServing > 0
      - UnitOfMeasure: enum válido
      - Combinación MealId+IngredientId única (409 si duplicado)
    """
    if not comidas or not ingredientes:
        print("\n[3/7] Sin comidas o ingredientes — saltando MealIngredients.")
        return

    print("\n[3/7] Asignando ingredientes a comidas...")
    total = 0

    for comida in comidas:
        # Cada comida tendrá entre 2 y 5 ingredientes distintos
        sample_size = min(random.randint(2, 5), len(ingredientes))
        seleccionados = random.sample(ingredientes, sample_size)

        for ing in seleccionados:
            body = {
                "ingredientId":     ing["id"],
                "quantityPerServing": round(random.uniform(0.05, 0.5), 4),
                "unitOfMeasure":    random.choice(UNIT_OF_MEASURE),
            }
            data = api.post(
                f"/api/meals/{comida['id']}/ingredients",
                body,
                label=f"{comida['name']} + {ing['name']}"
            )
            if data:
                total += 1
        time.sleep(0.05)

    print(f"  → {total} relaciones comida-ingrediente creadas.")


# ── Sección 4: Beneficiarios ──────────────────────────────────────────────────

def seed_beneficiarios(api: ApiClient) -> list[dict]:
    """
    POST /api/beneficiaries
    Rol: Administrador o Recepcionista
    Validaciones:
      - FirstName/LastName: 2–100 chars, requerido
      - DateOfBirth: requerido
      - Sex: enum válido (string)
      - IdentityDocument: si edad >= 18 ES OBLIGATORIO, exactamente 11 dígitos, único
      - PhoneNumber: formato teléfono, max 20
      - Address: max 300
      - EmergencyContact: max 200
      - Notes: max 1000
    """
    print("\n[4/7] Insertando beneficiarios...")
    beneficiarios = []

    # Distribución demográfica realista:
    # 60% adultos, 25% adultos mayores, 15% menores
    dist = (
        ["adult"]  * int(N_BENEFICIARIOS * 0.60) +
        ["elder"]  * int(N_BENEFICIARIOS * 0.25) +
        ["minor"]  * int(N_BENEFICIARIOS * 0.15)
    )
    # Completar si queda alguno
    while len(dist) < N_BENEFICIARIOS:
        dist.append("adult")
    random.shuffle(dist)

    for i in range(N_BENEFICIARIOS):
        tipo = dist[i]
        nombre   = random.choice(PRIMEROS_NOMBRES)
        apellido = random.choice(APELLIDOS)
        sexo     = random.choice(SEX_VALUES)

        if tipo == "minor":
            dob = random_dob_minor()
        elif tipo == "elder":
            dob = random_dob_elder()
        else:
            dob = random_dob_adult()

        edad = age_from_dob(dob)

        # Regla de negocio: adultos >= 18 DEBEN tener cédula de 11 dígitos
        cedula = random_cedula() if edad >= 18 else None

        body = {
            "firstName":        nombre,
            "lastName":         apellido,
            "dateOfBirth":      dob,
            "sex":              sexo,
            "identityDocument": cedula,
            "phoneNumber":      random_phone(),
            "address":          f"Calle {random.randint(1,50)}, Sector {random.choice(['Norte','Sur','Este','Oeste'])}, Santo Domingo",
            "emergencyContact": f"{random.choice(PRIMEROS_NOMBRES)} {random.choice(APELLIDOS)} — {random_phone()}",
            "notes":            random.choice([None, "Beneficiario regular", "Prefiere comida sin sal", "Necesita silla de ruedas"]),
        }

        data = api.post("/api/beneficiaries", body, label=f"{nombre} {apellido}")
        if data:
            beneficiarios.append(data)
            tipo_label = f"{edad}a {tipo}"
            print(f"  ✓ Beneficiario: {data['fullName']} [{data['internalCode']}] ({tipo_label})")
        time.sleep(0.08)

    print(f"  → {len(beneficiarios)} beneficiarios creados.")
    return beneficiarios


# ── Sección 5: Perfiles de salud ──────────────────────────────────────────────

def seed_health_profiles(api: ApiClient, beneficiarios: list[dict]):
    """
    PUT /api/beneficiaries/{id}/health-profile  (Upsert)
    Rol: Administrador o Recepcionista
    Validaciones:
      - MedicalConditions: max 1000
      - DietaryRestrictions: max 500
      - Allergies: max 500
      - HasHypertension / HasDiabetes: bool
      - SpecialConditions: flags enum (int): Ninguna=0, AdultoMayor=1, Menor=2,
        Embarazada=4, Lactancia=8, Discapacidad=16 — se pueden combinar con |
      - NutritionalNotes / AdditionalNotes: max 1000
    """
    if not beneficiarios:
        print("\n[5/7] Sin beneficiarios — saltando perfiles de salud.")
        return

    print("\n[5/7] Insertando perfiles de salud...")
    total = 0

    for ben in beneficiarios:
        edad = ben.get("age", 30)

        # Probabilidades según edad
        hyp  = random.random() < (0.45 if edad >= 60 else 0.10)
        diab = random.random() < (0.25 if edad >= 50 else 0.05)
        cond = random.choice(CONDICIONES_MEDICAS)
        aleg = random.choice(ALERGIAS)
        rest = random.choice(RESTRICCIONES) if (hyp or diab) else random.choice([None, None, None, random.choice(RESTRICCIONES)])

        # SpecialCondition según edad (flags — se envían como int)
        if edad < 18:
            special = 2   # Menor
        elif edad >= 65:
            special = 1   # AdultoMayor
        else:
            special = random.choice(SPECIAL_CONDITION)

        body = {
            "medicalConditions":   cond,
            "dietaryRestrictions": rest,
            "allergies":           aleg,
            "hasHypertension":     hyp,
            "hasDiabetes":         diab,
            "specialConditions":   special,
            "nutritionalNotes":    "Requiere porciones moderadas." if diab else None,
            "additionalNotes":     "Seguimiento mensual." if hyp else None,
        }

        data = api.put(
            f"/api/beneficiaries/{ben['id']}/health-profile",
            body,
            label=f"HP → {ben['fullName']}"
        )
        if data:
            total += 1
            flags = []
            if data.get("hasHypertension"): flags.append("HTA")
            if data.get("hasDiabetes"):     flags.append("DM")
            if data.get("allergies"):       flags.append("alergias")
            print(f"  ✓ HP {ben['internalCode']}: {', '.join(flags) or 'sin restricciones'}")
        time.sleep(0.05)

    print(f"  → {total} perfiles de salud guardados.")


# ── Sección 6: Planes de cocina ───────────────────────────────────────────────

def seed_kitchen_plans(api: ApiClient, comidas: list[dict]) -> list[dict]:
    """
    POST /api/kitchenplans
    POST /api/kitchenplans/preparations
    Rol: Administrador o Cocinero
    Validaciones KitchenPlan:
      - PlanDate + MealType: combinación única (409 si duplicado)
      - EstimatedBeneficiaries >= 0
      - EstimatedServings >= 0
    Validaciones Preparation:
      - DailyKitchenPlanId: debe existir
      - MealId: debe existir
      - EstimatedServings >= 1
      - DietType: enum válido
    """
    if not comidas:
        print("\n[6/7] Sin comidas — saltando planes de cocina.")
        return []

    print("\n[6/7] Insertando planes de cocina y preparaciones...")
    planes = []
    today = date.today()

    # Cada plan en un día y tipo de comida distinto para evitar duplicados
    # Usamos fecha actual y días futuros
    combos_usados: set = set()
    intentos = 0

    for i in range(N_PLANES):
        # Buscar una combinación PlanDate+MealType no usada
        found = False
        for offset in range(30):
            plan_date = (today + timedelta(days=offset)).isoformat()
            meal_type = random.choice(MEAL_TYPE_VALUES)
            key = (plan_date, meal_type)
            if key not in combos_usados:
                combos_usados.add(key)
                found = True
                break
        if not found:
            break

        beneficiarios_est = random.randint(30, 120)
        body = {
            "planDate":              plan_date,
            "mealType":              meal_type,
            "estimatedBeneficiaries": beneficiarios_est,
            "estimatedServings":     int(beneficiarios_est * 1.10),
            "notes":                 f"Plan del día {plan_date}",
        }

        data = api.post("/api/kitchenplans", body, label=f"Plan {plan_date} {meal_type}")
        if data:
            planes.append(data)
            plan_id = data["id"]
            print(f"  ✓ Plan {data['planDate']} ({data['mealType']}) id={plan_id}")

            # Agregar preparaciones a este plan
            num_preps = random.randint(1, min(3, len(comidas)))
            comidas_plan = random.sample(comidas, num_preps)

            for comida in comidas_plan:
                diet = random.choice(DIET_TYPE_VALUES)
                porciones = random.randint(10, 60)
                prep_body = {
                    "dailyKitchenPlanId": plan_id,
                    "mealId":            comida["id"],
                    "dietType":          diet,
                    "estimatedServings": porciones,
                    "notes":             None,
                }
                prep_data = api.post(
                    "/api/kitchenplans/preparations",
                    prep_body,
                    label=f"Prep {comida['name']} en plan {plan_id}"
                )
                if prep_data:
                    print(f"    ↳ Prep: {comida['name']} ({diet}) x{porciones}")
                time.sleep(0.05)

        time.sleep(0.08)

    print(f"  → {len(planes)} planes de cocina creados.")
    return planes


# ── Sección 7: Asistencias ────────────────────────────────────────────────────

def seed_asistencias(api: ApiClient, beneficiarios: list[dict]):
    """
    POST /api/attendances/check-in
    Rol: Administrador, Recepcionista o Voluntario
    Validaciones:
      - Requiere BeneficiaryId O InternalCode (al menos uno)
      - Beneficiario debe existir y estar Activo (BeneficiaryStatus.Activo)
      - Un solo check-in por beneficiario por DÍA (ServiceDate = UTC today)
        → 409 si ya registró hoy
      - CheckInMethod: max 20 chars, default "Manual"
      - Notes: max 500

    IMPORTANTE: Este endpoint registra la asistencia para HOY (fecha UTC del servidor).
    No se puede insertar asistencias para fechas pasadas ni futuras via este endpoint.
    """
    if not beneficiarios:
        print("\n[7/7] Sin beneficiarios — saltando asistencias.")
        return

    print("\n[7/7] Insertando asistencias (para HOY)...")

    # Solo beneficiarios activos (status = "Activo")
    activos = [b for b in beneficiarios if b.get("status") == "Activo"]

    if not activos:
        print("  [WARN] Ningún beneficiario activo encontrado.")
        return

    # Tomar una muestra aleatoria para hacer check-in
    muestra = random.sample(activos, min(N_ASISTENCIAS, len(activos)))
    methods = ["Manual", "CodigoInterno", "Tarjeta", "Biometrico"]
    total = 0

    for ben in muestra:
        method = random.choice(methods)
        # Usar InternalCode cuando el método lo amerita, BeneficiaryId para el resto
        if method == "CodigoInterno":
            body = {
                "internalCode":  ben["internalCode"],
                "checkInMethod": method,
                "notes":         None,
            }
        else:
            body = {
                "beneficiaryId": ben["id"],
                "checkInMethod": method,
                "notes":         random.choice([None, "Llegó puntual", "Asistencia regular", None]),
            }

        data = api.post("/api/attendances/check-in", body, label=f"Check-in {ben['internalCode']}")
        if data:
            total += 1
            print(f"  ✓ Check-in: {data['beneficiaryName']} [{data['beneficiaryInternalCode']}] — {data['checkInMethod']}")
        time.sleep(0.06)

    print(f"  → {total} asistencias registradas para hoy ({date.today().isoformat()}).")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  MesaDigna — Seeder de datos masivos")
    print(f"  Objetivo: {BASE_URL}")
    print("=" * 60)

    api = ApiClient(BASE_URL)

    # 1. Autenticación
    if not api.login(LOGIN_EMAIL, LOGIN_PASSWORD):
        print("\n[FATAL] No se pudo autenticar. Abortando.")
        sys.exit(1)

    random.seed(42)  # Reproducibilidad

    start = time.time()

    # 2. Insertar en orden de dependencias
    ingredientes  = seed_ingredientes(api)
    comidas       = seed_comidas(api)
    seed_meal_ingredients(api, comidas, ingredientes)
    beneficiarios = seed_beneficiarios(api)
    seed_health_profiles(api, beneficiarios)
    seed_kitchen_plans(api, comidas)
    seed_asistencias(api, beneficiarios)

    elapsed = time.time() - start
    print(f"\n{'=' * 60}")
    print(f"  ✅ Seeding completado en {elapsed:.1f}s")
    print(f"  Ingredientes: {len(ingredientes)}")
    print(f"  Comidas:      {len(comidas)}")
    print(f"  Beneficiarios: {len(beneficiarios)}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()