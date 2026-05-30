# RoutePulse AI - Portable Local Runbook

Estado del paquete: preparado para mover a otra computadora.

## Requisitos en la nueva PC

- Node.js 20 o superior.
- npm.
- Docker Desktop o Docker Engine compatible con Docker Compose.

## Instalacion

1. Descomprimir el ZIP.
2. Entrar a la carpeta:

```bash
cd routepulse-ai-tester
```

3. Instalar dependencias:

```bash
npm install
```

4. Crear variables locales:

```bash
cp .env.example .env
cp .env.example .env.local
```

5. Levantar Postgres y Redis:

```bash
docker compose up -d
```

6. Preparar Prisma:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

7. Levantar la app:

```bash
npm run dev
```

8. Abrir:

```text
http://localhost:3000
```

## Usuarios disponibles hoy

La web tester actual todavia usa el login demo local existente para admin/driver:

- Admin web tester: `admin@demo.com` / `admin123`
- Driver 1 web tester: `driver1@demo.com` / `driver123`
- Driver 2 web tester: `driver2@demo.com` / `driver123`

El seed Prisma crea usuarios futuros para backend:

- `admin@demo.com` / `Admin1234!`
- `dispatcher@demo.com` / `Demo1234!`

El backend NestJS real todavia no esta construido, por eso esos usuarios Prisma seran usados a partir del siguiente ciclo.

## Estado honesto

- Frontend Next.js corre.
- Prisma schema valida.
- Prisma client genera.
- Docker Compose esta definido.
- Migracion y seed requieren que Postgres este corriendo.
- NestJS, API real, Redis runtime, Socket.io y TanStack Query todavia son siguiente fase.

