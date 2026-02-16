# Este script carga datos iniciales en la base de datos PostgreSQL,
# inyectando variables de entorno de forma segura usando psql -v.
#
# Uso: ./scripts/seed.sh
# Requiere: archivo .env con DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD

# Configuración de seguridad del script
# -e: Detener si ocurre algún error
# -u: Error si se usan variables no definidas
# -o pipefail: Error si falla cualquier comando en un pipe
set -euo pipefail

echo "Iniciando proceso de Seed en la base de datos GlamStock..."

# 1. Verificar que el archivo .env existe
ENV_FILE="${ENV_FILE:-.env}"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Archivo $ENV_FILE no encontrado en la raíz del proyecto."
  echo "   Por favor, crea el archivo $ENV_FILE basándote en .env.example"
  exit 1
fi
echo "Archivo $ENV_FILE encontrado"

# 2. Cargar variables de entorno de forma segura
# set -a hace que todas las variables sean exportadas automáticamente
# set +a deshabilita el auto-export después de cargar
echo "Cargando variables de entorno..."
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

# 3. Validar que las variables necesarias existan
REQUIRED_VARS=("DATABASE_URL" "ADMIN_EMAIL" "ADMIN_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "Error: Faltan las siguientes variables en $ENV_FILE:"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  exit 1
fi
echo "Variables requeridas encontradas"

# 4. Validar formato básico del email (opcional pero recomendado)
if [[ ! "$ADMIN_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "Advertencia: El formato del ADMIN_EMAIL parece incorrecto"
fi

echo "Cifrando credenciales vía pgcrypto..."
echo "Inyectando datos semilla en la base de datos..."

# 5. Ejecutar el script SQL pasando las variables de entorno a psql
psql "$DATABASE_URL" \
  -v admin_email="$ADMIN_EMAIL" \
  -v admin_password="$ADMIN_PASSWORD" \
  -f src/lib/db/migrations/03_seed.sql

echo "Sembrado completado con éxito"
echo ""
echo "Usuario administrador creado:"
echo "  Email: $ADMIN_EMAIL"
echo "  (La contraseña ha sido cifrada con bcrypt)"
echo ""