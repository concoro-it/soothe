-- Soothe MVP initial schema
-- Multi-tenant family boundary + AI extraction + family memory search

create extension if not exists pgcrypto;
create extension if not exists vector;

create schema if not exists private;

create type family_role as enum ('owner', 'parent', 'caregiver');
create type family_member_status as enum ('active', 'invited', 'removed');
create type content_input_type as enum ('note', 'image', 'pdf', 'voice', 'screenshot');
create type content_status as enum ('uploaded', 'processing', 'review_ready', 'confirmed', 'failed');
create type extraction_status as enum ('queued', 'running', 'succeeded', 'failed', 'retryable');
create type extracted_candidate_type as enum ('summary', 'task', 'event', 'payment', 'document', 'date', 'amount', 'link_child');
create type review_status as enum ('pending', 'accepted', 'rejected', 'edited');
create type task_status as enum ('open', 'done');
create type payment_status as enum ('pending', 'paid');
create type memory_source_type as enum ('content', 'task', 'event', 'payment', 'document');
create type memory_pipeline_source as enum ('ingestion', 'confirmation', 'manual');
create type invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type notification_job_status as enum ('scheduled', 'processing', 'sent', 'failed', 'canceled');
create type notification_job_type as enum ('task_due', 'task_overdue', 'event_upcoming', 'payment_upcoming', 'document_expiring', 'digest');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'en',
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references public.profiles(id),
  default_currency text not null default 'EUR',
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role family_role not null,
  status family_member_status not null default 'invited',
  invited_by_user_id uuid references public.profiles(id),
  joined_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (family_id, user_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  email text not null,
  role family_role not null,
  token_hash text not null,
  invited_by_user_id uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  status invitation_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  birth_date date not null,
  school_name text,
  notes text,
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  linked_child_id uuid references public.children(id) on delete set null,
  input_type content_input_type not null,
  title text,
  raw_text text,
  status content_status not null default 'uploaded',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.content_attachments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint,
  checksum_sha256 text,
  upload_status text not null default 'uploaded',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (family_id, content_item_id, storage_path)
);

create table if not exists public.extraction_runs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  pipeline_version text not null default 'v1',
  provider text not null default 'n8n',
  external_job_id text,
  status extraction_status not null default 'queued',
  attempts int not null default 0,
  idempotency_key text,
  started_at timestamptz,
  finished_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.extracted_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  extraction_run_id uuid not null references public.extraction_runs(id) on delete cascade,
  candidate_type extracted_candidate_type not null,
  payload_jsonb jsonb not null,
  confidence numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  review_status review_status not null default 'pending',
  reviewed_by_user_id uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  assignee_member_id uuid references public.family_members(id) on delete set null,
  linked_child_id uuid references public.children(id) on delete set null,
  status task_status not null default 'open',
  source_content_item_id uuid references public.content_items(id) on delete set null,
  source_extracted_item_id uuid references public.extracted_items(id) on delete set null,
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  responsible_member_id uuid references public.family_members(id) on delete set null,
  linked_child_id uuid references public.children(id) on delete set null,
  source_content_item_id uuid references public.content_items(id) on delete set null,
  source_extracted_item_id uuid references public.extracted_items(id) on delete set null,
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  category text not null,
  amount_minor bigint not null,
  currency text not null default 'EUR',
  due_date date not null,
  status payment_status not null default 'pending',
  is_recurring boolean not null default false,
  recurrence_rule text,
  paid_at timestamptz,
  linked_child_id uuid references public.children(id) on delete set null,
  source_content_item_id uuid references public.content_items(id) on delete set null,
  source_extracted_item_id uuid references public.extracted_items(id) on delete set null,
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  category text not null,
  linked_child_id uuid references public.children(id) on delete set null,
  expiry_date date,
  primary_attachment_id uuid,
  source_content_item_id uuid references public.content_items(id) on delete set null,
  source_extracted_item_id uuid references public.extracted_items(id) on delete set null,
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.documents
  add constraint documents_primary_attachment_id_fkey
  foreign key (primary_attachment_id)
  references public.content_attachments(id)
  on delete set null;

create table if not exists public.memory_nodes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  source_type memory_source_type not null,
  source_id uuid not null,
  text_for_search text not null,
  metadata_jsonb jsonb not null default '{}'::jsonb,
  created_by_pipeline memory_pipeline_source not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.memory_embeddings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  memory_node_id uuid not null references public.memory_nodes(id) on delete cascade,
  embedding_model text not null,
  embedding_dim int not null default 1536,
  embedding vector(1536) not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (memory_node_id, embedding_model)
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  push_enabled boolean not null default true,
  email_enabled boolean not null default false,
  digest_enabled boolean not null default true,
  digest_time_local time not null default '08:00',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (family_id, user_id)
);

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null,
  platform text not null,
  app_version text,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, expo_push_token)
);

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_type notification_job_type not null,
  payload_jsonb jsonb not null,
  scheduled_for timestamptz not null,
  status notification_job_status not null default 'scheduled',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_family_members_family_user on public.family_members (family_id, user_id);
create index if not exists idx_children_family_name on public.children (family_id, name);
create index if not exists idx_content_items_family_status_created on public.content_items (family_id, status, created_at desc);
create index if not exists idx_extraction_runs_family_status_created on public.extraction_runs (family_id, status, created_at desc);
create index if not exists idx_tasks_family_status_due on public.tasks (family_id, status, due_at);
create index if not exists idx_events_family_starts_at on public.events (family_id, starts_at);
create index if not exists idx_payments_family_status_due on public.payments (family_id, status, due_date);
create index if not exists idx_documents_family_expiry on public.documents (family_id, expiry_date);
create index if not exists idx_memory_nodes_family_source on public.memory_nodes (family_id, source_type, source_id);
create index if not exists idx_memory_nodes_metadata on public.memory_nodes using gin (metadata_jsonb);
create index if not exists idx_memory_embeddings_family_node on public.memory_embeddings (family_id, memory_node_id);
create index if not exists idx_notification_jobs_family_status_scheduled on public.notification_jobs (family_id, status, scheduled_for);
create index if not exists idx_memory_embeddings_vector on public.memory_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_families_updated_at
before update on public.families
for each row execute function public.set_updated_at();

create trigger set_family_members_updated_at
before update on public.family_members
for each row execute function public.set_updated_at();

create trigger set_invitations_updated_at
before update on public.invitations
for each row execute function public.set_updated_at();

create trigger set_children_updated_at
before update on public.children
for each row execute function public.set_updated_at();

create trigger set_content_items_updated_at
before update on public.content_items
for each row execute function public.set_updated_at();

create trigger set_content_attachments_updated_at
before update on public.content_attachments
for each row execute function public.set_updated_at();

create trigger set_extraction_runs_updated_at
before update on public.extraction_runs
for each row execute function public.set_updated_at();

create trigger set_extracted_items_updated_at
before update on public.extracted_items
for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create trigger set_memory_nodes_updated_at
before update on public.memory_nodes
for each row execute function public.set_updated_at();

create trigger set_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

create trigger set_device_tokens_updated_at
before update on public.device_tokens
for each row execute function public.set_updated_at();

create trigger set_notification_jobs_updated_at
before update on public.notification_jobs
for each row execute function public.set_updated_at();

create or replace function private.is_family_member(target_family uuid, target_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family
      and fm.user_id = target_user
      and fm.status = 'active'
  );
$$;

create or replace function private.is_family_admin(target_family uuid, target_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family
      and fm.user_id = target_user
      and fm.status = 'active'
      and fm.role in ('owner', 'parent')
  );
$$;

create or replace function public.search_memory_nodes(
  p_family_id uuid,
  p_query_embedding vector(1536),
  p_limit int default 8,
  p_similarity_threshold float default 0.2
)
returns table (
  memory_node_id uuid,
  source_type memory_source_type,
  source_id uuid,
  text_for_search text,
  metadata_jsonb jsonb,
  similarity float
)
language sql
security definer
set search_path = public
as $$
  select
    mn.id,
    mn.source_type,
    mn.source_id,
    mn.text_for_search,
    mn.metadata_jsonb,
    1 - (me.embedding <=> p_query_embedding) as similarity
  from public.memory_embeddings me
  join public.memory_nodes mn on mn.id = me.memory_node_id
  where mn.family_id = p_family_id
    and me.family_id = p_family_id
    and 1 - (me.embedding <=> p_query_embedding) >= p_similarity_threshold
  order by me.embedding <=> p_query_embedding
  limit p_limit;
$$;

grant execute on function public.search_memory_nodes(uuid, vector, int, float) to authenticated;

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.invitations enable row level security;
alter table public.children enable row level security;
alter table public.content_items enable row level security;
alter table public.content_attachments enable row level security;
alter table public.extraction_runs enable row level security;
alter table public.extracted_items enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.memory_nodes enable row level security;
alter table public.memory_embeddings enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.device_tokens enable row level security;
alter table public.notification_jobs enable row level security;

create policy profiles_self_access
on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

create policy families_member_read
on public.families
for select
using (private.is_family_member(id));

create policy families_admin_write
on public.families
for all
using (private.is_family_admin(id))
with check (private.is_family_admin(id));

create policy family_members_member_read
on public.family_members
for select
using (private.is_family_member(family_id));

create policy family_members_admin_write
on public.family_members
for all
using (private.is_family_admin(family_id))
with check (private.is_family_admin(family_id));

create policy invitations_member_read
on public.invitations
for select
using (private.is_family_member(family_id));

create policy invitations_admin_write
on public.invitations
for all
using (private.is_family_admin(family_id))
with check (private.is_family_admin(family_id));

create policy children_family_access
on public.children
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy content_items_family_access
on public.content_items
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy content_attachments_family_access
on public.content_attachments
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy extraction_runs_family_access
on public.extraction_runs
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy extracted_items_family_access
on public.extracted_items
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy tasks_family_access
on public.tasks
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy events_family_access
on public.events
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy payments_family_access
on public.payments
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy documents_family_access
on public.documents
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy memory_nodes_family_access
on public.memory_nodes
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy memory_embeddings_family_access
on public.memory_embeddings
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy notification_preferences_family_access
on public.notification_preferences
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy device_tokens_family_access
on public.device_tokens
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));

create policy notification_jobs_family_access
on public.notification_jobs
for all
using (private.is_family_member(family_id))
with check (private.is_family_member(family_id));
