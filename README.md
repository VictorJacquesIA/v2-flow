# V2 Flow

Sistema de gestão interna para a V2 Agency. Controle de clientes, projetos, tarefas, financeiro, serviços e ideias.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth)
- **Deploy:** Vercel

## Setup

### 1. Clone e instale as dependências

```bash
cd "v2 flow"
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com os seus dados:

```bash
cp .env.example .env.local
```

Preencha o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Gere com: openssl rand -hex 32
ENCRYPTION_KEY=sua_chave_de_32_bytes_em_hex

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse o **SQL Editor** no painel do Supabase
3. Execute o arquivo `supabase/schema.sql` (já inclui seed com serviços padrão)
4. Crie um usuário em **Authentication > Users > Invite User**

### 4. Rode o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

1. Faça push para GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no painel da Vercel (mesmo conteúdo do `.env.local`)
4. Deploy automático a cada push

## Módulos

| Módulo | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/dashboard` | Métricas e visão geral |
| Clientes | `/clientes` | CRUD + página individual com abas |
| Projetos | `/projetos` | Pipeline de projetos |
| Tarefas | `/tarefas` | Kanban de tarefas |
| Financeiro | `/financeiro` | Cobranças e recebimentos |
| Serviços | `/servicos` | Catálogo de serviços |
| Ideias | `/ideias` | Banco de ideias |
| Configurações | `/configuracoes` | Info da conta e sistema |

## Estrutura do projeto

```
src/
├── app/
│   ├── (dashboard)/        # Páginas protegidas
│   │   ├── dashboard/
│   │   ├── clientes/
│   │   ├── projetos/
│   │   ├── tarefas/
│   │   ├── financeiro/
│   │   ├── servicos/
│   │   ├── ideias/
│   │   └── configuracoes/
│   ├── actions/            # Server Actions
│   └── login/
├── components/
│   ├── ui/                 # Componentes base (shadcn-style)
│   ├── layout/             # Sidebar e Header
│   ├── clients/
│   ├── projects/
│   ├── tasks/
│   ├── charges/
│   ├── services/
│   ├── ideas/
│   ├── links/
│   └── accesses/
├── lib/
│   ├── supabase/           # Client e Server clients
│   ├── crypto.ts           # Criptografia para cofre de acessos
│   └── utils.ts            # Utilitários gerais
├── hooks/
│   └── use-toast.ts
├── types/
│   └── index.ts            # Tipos TypeScript
└── middleware.ts            # Proteção de rotas
```

## Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) habilitado em todas as tabelas
- Senhas do cofre de acessos criptografadas com AES-256-GCM
- Rotas protegidas por middleware

## Notas de desenvolvimento

- Para adicionar um novo usuário: Supabase Dashboard → Authentication → Users → Invite User
- As senhas no cofre são criptografadas antes de salvar. Configure `ENCRYPTION_KEY` obrigatoriamente em produção
- O schema já inclui seed com 8 serviços padrão
