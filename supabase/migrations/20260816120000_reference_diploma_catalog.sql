begin;

-- The source workbook is a reference catalogue, not a verified public
-- institution directory.  Keep its provenance and its unreviewed records
-- separate from universities/courses that power the three portals.
create table private.reference_import_runs (
  id uuid primary key default extensions.uuid_generate_v4(),
  source_filename text not null,
  source_sha256 text not null,
  source_row_count integer not null,
  status text not null default 'prepared',
  imported_at timestamptz,
  notes text,
  created_at timestamptz not null default current_timestamp,
  constraint reference_import_runs_sha256_format check (source_sha256 ~ '^[0-9a-f]{64}$'),
  constraint reference_import_runs_row_count check (source_row_count > 0),
  constraint reference_import_runs_status check (status in ('prepared', 'applied', 'failed')),
  constraint reference_import_runs_source_sha256_key unique (source_sha256)
);

create table public.reference_institutions (
  id uuid primary key default extensions.uuid_generate_v4(),
  source_name text not null,
  normalized_name text not null,
  previous_name text,
  first_import_id uuid not null references private.reference_import_runs (id),
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint reference_institutions_normalized_name_key unique (normalized_name),
  constraint reference_institutions_normalized_name_check check (normalized_name = lower(trim(normalized_name)))
);

create table public.reference_institution_aliases (
  id uuid primary key default extensions.uuid_generate_v4(),
  reference_institution_id uuid not null references public.reference_institutions (id) on delete cascade,
  alias text not null,
  normalized_alias text not null,
  alias_kind text not null,
  created_at timestamptz not null default current_timestamp,
  constraint reference_institution_aliases_kind check (alias_kind in ('previous_name', 'manual')),
  constraint reference_institution_aliases_normalized_alias_check check (normalized_alias = lower(trim(normalized_alias))),
  constraint reference_institution_aliases_unique_alias unique (reference_institution_id, normalized_alias)
);

create table public.nec_classifications (
  code text primary key,
  description text not null,
  broad_area text not null,
  first_import_id uuid not null references private.reference_import_runs (id),
  created_at timestamptz not null default current_timestamp,
  constraint nec_classifications_code_check check (code ~ '^[0-9]{3,4}$')
);

create table public.reference_programmes (
  canonical_record_id text primary key,
  reference_institution_id uuid not null references public.reference_institutions (id),
  source_bil_first integer not null,
  source_bils_all text not null,
  reference_no text not null,
  reference_family text not null,
  qualification_name text not null,
  normalized_qualification_name text not null,
  previous_qualification_name text,
  nec_code text not null references public.nec_classifications (code),
  import_id uuid not null references private.reference_import_runs (id),
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint reference_programmes_record_id_check check (canonical_record_id ~ '^MQA-[0-9]{5}$'),
  constraint reference_programmes_source_bil_first_check check (source_bil_first > 0),
  constraint reference_programmes_normalized_name_check check (normalized_qualification_name = lower(trim(normalized_qualification_name)))
);

create index reference_programmes_institution_idx on public.reference_programmes (reference_institution_id);
create index reference_programmes_nec_idx on public.reference_programmes (nec_code);
create index reference_programmes_reference_no_idx on public.reference_programmes (reference_no);
create index reference_programmes_qualification_search_idx on public.reference_programmes (normalized_qualification_name);

create table public.reference_programme_aliases (
  id uuid primary key default extensions.uuid_generate_v4(),
  canonical_record_id text not null references public.reference_programmes (canonical_record_id) on delete cascade,
  alias text not null,
  normalized_alias text not null,
  alias_kind text not null,
  created_at timestamptz not null default current_timestamp,
  constraint reference_programme_aliases_kind check (alias_kind in ('previous_name', 'manual')),
  constraint reference_programme_aliases_normalized_alias_check check (normalized_alias = lower(trim(normalized_alias))),
  constraint reference_programme_aliases_unique_alias unique (canonical_record_id, normalized_alias)
);

create table public.reference_programme_collaborations (
  canonical_record_id text not null references public.reference_programmes (canonical_record_id) on delete cascade,
  partner_name text not null,
  normalized_partner_name text not null,
  created_at timestamptz not null default current_timestamp,
  primary key (canonical_record_id, normalized_partner_name),
  constraint reference_programme_collaborations_normalized_name_check check (normalized_partner_name = lower(trim(normalized_partner_name)))
);

-- Linking is a deliberate review operation.  It does not claim that every
-- row in the workbook is currently offered or approved for public display.
create table public.reference_institution_links (
  reference_institution_id uuid primary key references public.reference_institutions (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  status text not null default 'pending',
  match_method text not null default 'manual',
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default current_timestamp,
  constraint reference_institution_links_status check (status in ('pending', 'verified', 'rejected')),
  constraint reference_institution_links_match_method check (match_method in ('manual', 'normalized_name', 'import')),
  constraint reference_institution_links_reviewed_at check ((status = 'verified' and reviewed_at is not null) or status <> 'verified')
);
create index reference_institution_links_university_idx on public.reference_institution_links (university_id);

create table public.reference_programme_links (
  canonical_record_id text primary key references public.reference_programmes (canonical_record_id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  status text not null default 'pending',
  match_method text not null default 'manual',
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default current_timestamp,
  constraint reference_programme_links_status check (status in ('pending', 'verified', 'rejected')),
  constraint reference_programme_links_match_method check (match_method in ('manual', 'normalized_name', 'import')),
  constraint reference_programme_links_reviewed_at check ((status = 'verified' and reviewed_at is not null) or status <> 'verified')
);
create index reference_programme_links_course_idx on public.reference_programme_links (course_id);

create table public.portal_catalog_visibility (
  university_id uuid not null references public.universities (id) on delete cascade,
  portal text not null,
  status text not null default 'draft',
  published_at timestamptz,
  notes text,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  primary key (university_id, portal),
  constraint portal_catalog_visibility_portal check (portal in ('inpel', 'inpeler', 'inpolor')),
  constraint portal_catalog_visibility_status check (status in ('draft', 'published', 'hidden')),
  constraint portal_catalog_visibility_published_at check ((status = 'published' and published_at is not null) or status <> 'published')
);
create index portal_catalog_visibility_portal_status_idx on public.portal_catalog_visibility (portal, status, university_id);

-- The three portal applications use these projections as their single shared
-- read model. They contain source-backed catalogue facts only; community
-- content and unverified institution profile claims remain outside this view.
create or replace view public.shared_catalog_institutions
with (security_invoker = false) as
select
  ri.id as reference_institution_id,
  ri.source_name as institution_name,
  ri.previous_name as institution_previous_name,
  ril.university_id,
  (ril.status = 'verified') as is_linked_to_university,
  count(rp.canonical_record_id)::integer as programme_count
from public.reference_institutions ri
left join public.reference_institution_links ril on ril.reference_institution_id = ri.id
left join public.reference_programmes rp on rp.reference_institution_id = ri.id
group by ri.id, ri.source_name, ri.previous_name, ril.university_id, ril.status;

create or replace view public.shared_catalog_programmes
with (security_invoker = false) as
select
  ri.id as reference_institution_id,
  ri.source_name as institution_name,
  rp.canonical_record_id,
  rp.reference_no,
  rp.reference_family,
  rp.qualification_name,
  rp.previous_qualification_name,
  rp.nec_code,
  nec.description as nec_description,
  nec.broad_area as nec_broad_area,
  rpl.course_id,
  (rpl.status = 'verified') as is_linked_to_course
from public.reference_programmes rp
join public.reference_institutions ri on ri.id = rp.reference_institution_id
join public.nec_classifications nec on nec.code = rp.nec_code
left join public.reference_programme_links rpl on rpl.canonical_record_id = rp.canonical_record_id;

-- These views deliberately expose only reviewed source metadata for universities
-- that INPOLOR has explicitly published.  Base reference tables remain closed
-- to browser roles; the views are the public API boundary.
create or replace view public.inpolor_catalog_institutions
with (security_invoker = false) as
select
  u.id as university_id,
  u.name as university_name,
  u.location,
  u.address,
  ri.id as reference_institution_id,
  ri.source_name as reference_institution_name,
  count(rpl.canonical_record_id)::integer as linked_programme_count
from public.universities u
join public.portal_catalog_visibility visibility
  on visibility.university_id = u.id
 and visibility.portal = 'inpolor'
 and visibility.status = 'published'
join public.reference_institution_links ril
  on ril.university_id = u.id
 and ril.status = 'verified'
join public.reference_institutions ri on ri.id = ril.reference_institution_id
left join public.reference_programmes rp on rp.reference_institution_id = ri.id
left join public.reference_programme_links rpl
  on rpl.canonical_record_id = rp.canonical_record_id
 and rpl.status = 'verified'
where u.verification_status = 'verified'
  and u.profile_status = 'complete'
  and u.is_suspended = false
group by u.id, u.name, u.location, u.address, ri.id, ri.source_name;

create or replace view public.inpolor_catalog_programmes
with (security_invoker = false) as
select
  u.id as university_id,
  c.id as course_id,
  rp.canonical_record_id,
  rp.reference_no,
  rp.reference_family,
  rp.qualification_name,
  rp.nec_code,
  nec.description as nec_description,
  nec.broad_area as nec_broad_area
from public.portal_catalog_visibility visibility
join public.universities u
  on u.id = visibility.university_id
join public.reference_institution_links ril
  on ril.university_id = u.id
 and ril.status = 'verified'
join public.reference_programmes rp on rp.reference_institution_id = ril.reference_institution_id
join public.reference_programme_links rpl
  on rpl.canonical_record_id = rp.canonical_record_id
 and rpl.status = 'verified'
join public.courses c
  on c.id = rpl.course_id
 and c.university_id = u.id
join public.nec_classifications nec on nec.code = rp.nec_code
where visibility.portal = 'inpolor'
  and visibility.status = 'published'
  and u.verification_status = 'verified'
  and u.profile_status = 'complete'
  and u.is_suspended = false;

alter table public.reference_institutions enable row level security;
alter table public.reference_institution_aliases enable row level security;
alter table public.nec_classifications enable row level security;
alter table public.reference_programmes enable row level security;
alter table public.reference_programme_aliases enable row level security;
alter table public.reference_programme_collaborations enable row level security;
alter table public.reference_institution_links enable row level security;
alter table public.reference_programme_links enable row level security;
alter table public.portal_catalog_visibility enable row level security;

revoke all on table private.reference_import_runs from public, anon, authenticated;
revoke all on table public.reference_institutions, public.reference_institution_aliases,
  public.nec_classifications, public.reference_programmes, public.reference_programme_aliases,
  public.reference_programme_collaborations, public.reference_institution_links,
  public.reference_programme_links, public.portal_catalog_visibility from public, anon, authenticated;
revoke all on table public.shared_catalog_institutions, public.shared_catalog_programmes,
  public.inpolor_catalog_institutions, public.inpolor_catalog_programmes from public, anon, authenticated;
grant select on table public.shared_catalog_institutions, public.shared_catalog_programmes,
  public.inpolor_catalog_institutions, public.inpolor_catalog_programmes to anon, authenticated;

commit;
