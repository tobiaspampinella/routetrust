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

La web tester actual usa credenciales demo locales para admin/driver.

Las credenciales concretas fueron movidas a `docs/DEMO_LOCAL_ONLY.md` para evitar publicarlas en la documentacion general del repositorio.

El backend NestJS real todavia no esta construido, por eso los usuarios definitivos de backend no deben considerarse operativos todavia.

## Estado honesto

- Frontend Next.js corre.
- Prisma schema valida.
- Prisma client genera.
- Docker Compose esta definido.
- Migracion y seed requieren que Postgres este corriendo.
- NestJS, API real, Redis runtime, Socket.io y TanStack Query todavia son siguiente fase.
