# CLAUDE.md — Instruções para Deploy Automatizado

Este arquivo contém instruções para que o Claude Code (ou qualquer agente de IA) consiga fazer o deploy completo desta aplicação em uma VPS usando Docker.

## Visão Geral do Projeto

Este é o **Acupunturista Master LMS**, uma plataforma de ensino online (Learning Management System) construída com:
- **Backend:** NestJS + Prisma ORM + PostgreSQL + Redis
- **Frontend:** Next.js (React)
- **Infraestrutura:** Docker Compose (PostgreSQL, Redis, Backend, Frontend)

## Deploy Rápido (Docker Compose)

### 1. Clonar o Repositório
```bash
git clone https://github.com/gfbrito/acupunturista-master-lms.git
cd acupunturista-master-lms
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```
Edite o arquivo `.env` e preencha:
- `APP_DOMAIN` — **O domínio do servidor** (ex: `acupunturistamaster.com.br`). Este é o campo mais importante, pois as URLs do frontend e backend são derivadas dele automaticamente.
- `POSTGRES_PASSWORD` — Troque para uma senha forte
- `JWT_SECRET` — Gere um secret aleatório (`openssl rand -base64 32`)
- `FRONTEND_URL` — URL pública do frontend (padrão: `https://APP_DOMAIN`)
- `NEXT_PUBLIC_API_URL` — URL pública do backend API (padrão: `https://api.APP_DOMAIN`)
- Credenciais do R2 e Bunny.net se necessário

> **IMPORTANTE — DOMÍNIO:** Antes de tudo, pergunte ao usuário qual será o domínio do servidor. A partir disso, preencha:
> - `APP_DOMAIN=dominio-do-usuario.com`
> - `FRONTEND_URL=https://dominio-do-usuario.com`
> - `NEXT_PUBLIC_API_URL=https://api.dominio-do-usuario.com`
>
> O `DATABASE_URL` é montado automaticamente a partir das variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`. Não edite o `DATABASE_URL` diretamente, a menos que esteja usando um banco externo. O host interno do Docker para o banco é `postgres` (nome do serviço no docker-compose).

### 3. Subir a Stack
```bash
docker compose up -d --build
```
Isso irá:
- Criar e iniciar um banco PostgreSQL 16 (dados persistidos em volume Docker)
- Criar e iniciar uma instância Redis 7
- Buildar e iniciar o Backend NestJS na porta 3001
- Buildar e iniciar o Frontend Next.js na porta 3000

### 4. Rodar as Migrations do Prisma (primeira vez)
Após todos os containers estarem rodando:
```bash
docker exec masterlms-backend npx prisma db push
```
Isso cria todas as tabelas no banco PostgreSQL automaticamente.

### 5. Criar o Primeiro Usuário Admin
```bash
docker exec -it masterlms-backend npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@masterlms.com',
      passwordHash: hash,
      role: 'ADMIN',
    },
  });
  console.log('Admin criado:', user.email);
}
main().finally(() => prisma.\$disconnect());
"
```

## Arquitetura dos Containers

| Container             | Porta | Descrição                          |
|-----------------------|-------|------------------------------------|
| `masterlms-db`        | 5432  | PostgreSQL 16 (banco de dados)     |
| `masterlms-redis`     | 6379  | Redis 7 (cache)                    |
| `masterlms-backend`   | 3001  | NestJS API                         |
| `masterlms-frontend`  | 3000  | Next.js (interface do usuário)     |

## Onde Ficam os Dados do PostgreSQL

Os dados do PostgreSQL são persistidos em um **Docker Volume** chamado `masterlms_postgres_data`. Isso significa que mesmo que o container seja destruído e recriado, os dados do banco NÃO serão perdidos.

Para fazer backup dos dados:
```bash
docker exec masterlms-db pg_dump -U masterlms masterlms > backup_$(date +%Y%m%d).sql
```

Para restaurar:
```bash
cat backup.sql | docker exec -i masterlms-db psql -U masterlms masterlms
```

## Proxy Reverso (Nginx)

Para produção, configure um proxy reverso (Nginx, Caddy, Traefik, etc.) para:
- `seudominio.com` → `localhost:3000` (frontend)
- `api.seudominio.com` → `localhost:3001` (backend)

Exemplo Nginx:
```nginx
server {
    server_name app.seudominio.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name api.seudominio.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Comandos Úteis

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Reiniciar um serviço específico
docker compose restart backend

# Parar tudo
docker compose down

# Parar tudo E deletar os volumes (PERDE OS DADOS!)
docker compose down -v

# Rebuild após atualização de código
git pull && docker compose up -d --build
```

## Migração de Dados do Supabase

Se houver dados existentes no Supabase para importar:
```bash
# 1. Exportar do Supabase (rodar no computador local)
pg_dump --clean --if-exists --quote-all-identifiers \
  -h db.oagafpkzukcpsqzhwvus.supabase.co \
  -U postgres -d postgres > supabase_dump.sql

# 2. Importar na VPS (após copiar o arquivo para a VPS)
cat supabase_dump.sql | docker exec -i masterlms-db psql -U masterlms masterlms
```
