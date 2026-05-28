-- V2 Flow - Schema SQL
-- Execute este arquivo no SQL Editor do Supabase

-- Habilitar extensão para UUID
create extension if not exists "uuid-ossp";

-- =====================
-- CLIENTES
-- =====================
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  company text,
  niche text,
  whatsapp text,
  email text,
  domain text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'lead', 'pausado')),
  entry_date date,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================
-- SERVIÇOS
-- =====================
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  base_price numeric(10,2),
  type text not null default 'unico' check (type in ('unico', 'recorrente')),
  created_at timestamptz default now() not null
);

-- =====================
-- PROJETOS
-- =====================
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  name text not null,
  service_type text,
  status text not null default 'lead' check (
    status in (
      'lead', 'proposta_enviada', 'fechado', 'aguardando_conteudo',
      'em_desenvolvimento', 'em_revisao', 'entregue', 'manutencao'
    )
  ),
  priority text not null default 'media' check (priority in ('baixa', 'media', 'alta', 'urgente')),
  start_date date,
  deadline date,
  value numeric(10,2),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================
-- TAREFAS
-- =====================
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  client_id uuid references clients(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  priority text not null default 'media' check (priority in ('baixa', 'media', 'alta', 'urgente')),
  status text not null default 'pendente' check (status in ('pendente', 'fazendo', 'aguardando', 'concluida')),
  deadline date,
  checklist jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================
-- COBRANÇAS (FINANCEIRO)
-- =====================
create table if not exists charges (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  project_id uuid references projects(id) on delete set null,
  description text not null,
  value numeric(10,2) not null,
  due_date date not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado', 'cancelado')),
  recurring boolean default false,
  payment_method text check (
    payment_method in ('pix', 'boleto', 'cartao_credito', 'transferencia', 'outro')
  ),
  paid_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================
-- LINKS IMPORTANTES
-- =====================
create table if not exists links (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  url text not null,
  category text not null default 'outro' check (
    category in (
      'site', 'vercel', 'analytics', 'search_console', 'tag_manager',
      'clarity', 'meta_pixel', 'canva', 'drive', 'whatsapp', 'dominio', 'outro'
    )
  ),
  notes text,
  created_at timestamptz default now() not null
);

-- =====================
-- COFRE DE ACESSOS
-- =====================
create table if not exists accesses (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  username text,
  -- IMPORTANTE: Em produção, a senha DEVE ser criptografada antes de inserir.
  -- Use a função de criptografia disponível em src/lib/crypto.ts
  password_encrypted text,
  url text,
  category text not null default 'outro' check (
    category in ('hospedagem', 'dominio', 'email', 'social_media', 'ferramenta', 'banco', 'outro')
  ),
  notes text,
  created_at timestamptz default now() not null
);

-- =====================
-- BANCO DE IDEIAS
-- =====================
create table if not exists ideas (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text,
  potential text not null default 'medio' check (potential in ('baixo', 'medio', 'alto')),
  difficulty text not null default 'medio' check (difficulty in ('facil', 'medio', 'dificil')),
  stage text not null default 'ideia' check (
    stage in ('ideia', 'validando', 'em_construcao', 'pausada', 'descartada', 'lancada')
  ),
  monetization text,
  next_steps text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================
-- TRIGGERS: updated_at automático
-- =====================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();

create trigger projects_updated_at before update on projects
  for each row execute function update_updated_at();

create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

create trigger charges_updated_at before update on charges
  for each row execute function update_updated_at();

create trigger ideas_updated_at before update on ideas
  for each row execute function update_updated_at();

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table clients enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table charges enable row level security;
alter table links enable row level security;
alter table accesses enable row level security;
alter table ideas enable row level security;
alter table services enable row level security;

-- Políticas: apenas usuários autenticados acessam os dados
create policy "Authenticated users can manage clients"
  on clients for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage projects"
  on projects for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage tasks"
  on tasks for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage charges"
  on charges for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage links"
  on links for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage accesses"
  on accesses for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage ideas"
  on ideas for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage services"
  on services for all using (auth.role() = 'authenticated');

-- =====================
-- SEED: Serviços padrão
-- =====================
insert into services (name, description, base_price, type) values
  ('Landing Page', 'Página de conversão focada em um produto ou serviço', 1500.00, 'unico'),
  ('Site Institucional', 'Site completo com múltiplas páginas para a empresa', 3500.00, 'unico'),
  ('SEO Local', 'Otimização para buscas locais no Google', 800.00, 'recorrente'),
  ('Google Meu Negócio', 'Gestão e otimização do perfil no Google', 300.00, 'recorrente'),
  ('Manutenção', 'Manutenção mensal de site existente', 400.00, 'recorrente'),
  ('Automação', 'Criação de automações e fluxos de trabalho', 2000.00, 'unico'),
  ('Tráfego Pago', 'Gestão de campanhas no Google Ads ou Meta Ads', 1200.00, 'recorrente'),
  ('Consultoria', 'Consultoria estratégica em marketing digital', 500.00, 'unico')
on conflict do nothing;

-- =====================
-- EBOOK GENERATIONS
-- =====================
create table if not exists ebook_generations (
  id uuid default uuid_generate_v4() primary key,
  business_name text not null,
  city text not null,
  niche text not null,
  keyword text not null,
  file_name text not null,
  created_at timestamptz default now() not null
);

alter table ebook_generations enable row level security;

create policy "Authenticated users can manage ebook_generations"
  on ebook_generations for all using (auth.role() = 'authenticated');
