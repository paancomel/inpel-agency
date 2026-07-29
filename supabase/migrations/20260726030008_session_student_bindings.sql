-- Migration 1: additive trusted parent -> session -> student binding schema.
-- This migration intentionally does not alter existing tables, data, RLS, or grants.

begin;

create table public.session_student_bindings (
  id uuid not null default extensions.uuid_generate_v4(),
  session_id uuid not null,
  student_id uuid,
  token_digest bytea not null,
  invited_email_digest bytea not null,
  status text not null default 'issued',
  expires_at timestamptz not null default (current_timestamp + interval '24 hours'),
  claimed_at timestamptz,
  claimed_by uuid,
  revoked_at timestamptz,
  revoked_by uuid,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,

  constraint session_student_bindings_pkey primary key (id),
  constraint session_student_bindings_session_id_key unique (session_id),
  constraint session_student_bindings_token_digest_key unique (token_digest),
  constraint session_student_bindings_session_id_student_id_key unique (session_id, student_id),
  constraint session_student_bindings_session_id_fkey
    foreign key (session_id) references public.sessions (id) on delete cascade,
  constraint session_student_bindings_student_id_fkey
    foreign key (student_id) references public.profiles (id) on delete no action,
  constraint session_student_bindings_claimed_by_fkey
    foreign key (claimed_by) references public.profiles (id) on delete no action,
  constraint session_student_bindings_revoked_by_fkey
    foreign key (revoked_by) references public.profiles (id) on delete no action,
  constraint session_student_bindings_status_check
    check (status in ('issued', 'claimed', 'expired', 'revoked')),
  constraint session_student_bindings_token_digest_length_check
    check (octet_length(token_digest) = 32),
  constraint session_student_bindings_invited_email_digest_length_check
    check (octet_length(invited_email_digest) = 32),
  constraint session_student_bindings_expiry_contract_check
    check (expires_at = created_at + interval '24 hours'),
  constraint session_student_bindings_timestamps_check
    check (
      (claimed_at is null or claimed_at >= created_at)
      and (revoked_at is null or revoked_at >= created_at)
      and updated_at >= created_at
    ),
  constraint session_student_bindings_state_check
    check (
      (status = 'issued'
        and student_id is null
        and claimed_at is null
        and claimed_by is null
        and revoked_at is null
        and revoked_by is null)
      or (status = 'claimed'
        and student_id is not null
        and claimed_at is not null
        and claimed_by = student_id
        and revoked_at is null
        and revoked_by is null)
      or (status = 'expired'
        and student_id is null
        and claimed_at is null
        and claimed_by is null
        and revoked_at is null
        and revoked_by is null)
      or (status = 'revoked'
        and student_id is null
        and claimed_at is null
        and claimed_by is null
        and revoked_at is not null
        and revoked_by is not null)
    )
);

create index session_student_bindings_lifecycle_idx
  on public.session_student_bindings (status, expires_at);

create index session_student_bindings_student_id_idx
  on public.session_student_bindings (student_id);

create index session_student_bindings_claimed_by_idx
  on public.session_student_bindings (claimed_by);

create index session_student_bindings_revoked_by_idx
  on public.session_student_bindings (revoked_by);

commit;
