export type ClientStatus = "ativo" | "inativo" | "lead" | "pausado";

export type ProjectStatus =
  | "lead"
  | "proposta_enviada"
  | "fechado"
  | "aguardando_conteudo"
  | "em_desenvolvimento"
  | "em_revisao"
  | "entregue"
  | "manutencao";

export type ProjectPriority = "baixa" | "media" | "alta" | "urgente";

export type TaskStatus = "pendente" | "fazendo" | "aguardando" | "concluida";
export type TaskPriority = "baixa" | "media" | "alta" | "urgente";

export type ChargeStatus = "pendente" | "pago" | "atrasado" | "cancelado";
export type PaymentMethod =
  | "pix"
  | "boleto"
  | "cartao_credito"
  | "transferencia"
  | "outro";

export type ServiceType = "unico" | "recorrente";

export type IdeaStage =
  | "ideia"
  | "validando"
  | "em_construcao"
  | "pausada"
  | "descartada"
  | "lancada";

export type IdeaPotential = "baixo" | "medio" | "alto";
export type IdeaDifficulty = "facil" | "medio" | "dificil";

export type LinkCategory =
  | "site"
  | "vercel"
  | "analytics"
  | "search_console"
  | "tag_manager"
  | "clarity"
  | "meta_pixel"
  | "canva"
  | "drive"
  | "whatsapp"
  | "dominio"
  | "outro";

export type AccessCategory =
  | "hospedagem"
  | "dominio"
  | "email"
  | "social_media"
  | "ferramenta"
  | "banco"
  | "outro";

export interface Client {
  id: string;
  name: string;
  company: string | null;
  niche: string | null;
  whatsapp: string | null;
  email: string | null;
  domain: string | null;
  status: ClientStatus;
  entry_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  service_type: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  deadline: string | null;
  value: number | null;
  progress: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  type: ServiceType;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  project_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  checklist: ChecklistItem[];
  created_at: string;
  updated_at: string;
  client?: Client;
  project?: Project;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Charge {
  id: string;
  client_id: string;
  project_id: string | null;
  description: string;
  value: number;
  due_date: string;
  status: ChargeStatus;
  recurring: boolean;
  payment_method: PaymentMethod | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  project?: Project;
}

export interface Link {
  id: string;
  client_id: string | null;
  project_id: string | null;
  title: string;
  url: string;
  category: LinkCategory;
  notes: string | null;
  created_at: string;
  client?: Client;
  project?: Project;
}

export interface Access {
  id: string;
  client_id: string | null;
  project_id: string | null;
  title: string;
  username: string | null;
  password_encrypted: string | null;
  url: string | null;
  category: AccessCategory;
  notes: string | null;
  created_at: string;
  client?: Client;
  project?: Project;
}

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  potential: IdeaPotential;
  difficulty: IdeaDifficulty;
  stage: IdeaStage;
  monetization: string | null;
  next_steps: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  activeClients: number;
  activeProjects: number;
  lateTasks: number;
  weekDeliveries: number;
  pendingCharges: number;
  monthRevenue: number;
}
