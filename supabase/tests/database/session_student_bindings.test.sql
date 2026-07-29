begin;

set local search_path = public, extensions;

select plan(21);

select has_table(
  'public',
  'session_student_bindings',
  'creates the additive session/student binding table'
);

select columns_are(
  'public',
  'session_student_bindings',
  array[
    'id', 'session_id', 'student_id', 'token_digest',
    'invited_email_digest', 'status', 'expires_at', 'claimed_at',
    'claimed_by', 'revoked_at', 'revoked_by', 'created_at', 'updated_at'
  ],
  'exposes the complete binding lifecycle contract'
);

select results_eq(
  $$
    select tc.constraint_name::text, rc.delete_rule::text
    from information_schema.table_constraints as tc
    join information_schema.referential_constraints as rc
      on rc.constraint_schema = tc.constraint_schema
     and rc.constraint_name = tc.constraint_name
    where tc.constraint_schema = 'public'
      and tc.table_name = 'session_student_bindings'
      and tc.constraint_type = 'FOREIGN KEY'
    order by tc.constraint_name
  $$,
  $$
    values
      ('session_student_bindings_claimed_by_fkey'::text, 'NO ACTION'::text),
      ('session_student_bindings_revoked_by_fkey'::text, 'NO ACTION'::text),
      ('session_student_bindings_session_id_fkey'::text, 'CASCADE'::text),
      ('session_student_bindings_student_id_fkey'::text, 'NO ACTION'::text)
  $$,
  'uses cascade only for the session owner row and no action for profile actors'
);

select col_type_is(
  'public', 'session_student_bindings', 'token_digest', 'bytea',
  'stores token digests as bytea'
);

select col_type_is(
  'public', 'session_student_bindings', 'invited_email_digest', 'bytea',
  'stores invited email digests as bytea'
);

select results_eq(
  $$
    select position('24:00:00' in column_default) > 0
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'session_student_bindings'
      and column_name = 'expires_at'
  $$,
  $$ values (true) $$,
  'defaults expiry to 24 hours after creation'
);

with new_sessions as (
  insert into public.sessions (status)
  select 'invited' from generate_series(1, 10)
  returning id
)
select row_number() over (order by id)::integer as slot, id
into temporary binding_test_sessions
from new_sessions;

create temporary table binding_test_students (id uuid primary key);
insert into binding_test_students (id)
select id
from public.profiles
where role = 'student'
limit 1;

select lives_ok(
  $$
    insert into public.session_student_bindings (session_id, token_digest, invited_email_digest)
    values (
      (select id from binding_test_sessions where slot = 1),
      decode(repeat('11', 32), 'hex'),
      decode(repeat('22', 32), 'hex')
    )
  $$,
  'accepts a valid issued row with the lifecycle defaults'
);

select throws_ok(
  $$
    insert into public.session_student_bindings (
      session_id, token_digest, invited_email_digest, status, claimed_at
    )
    values (
      (select id from binding_test_sessions where slot = 2),
      decode(repeat('33', 32), 'hex'),
      decode(repeat('44', 32), 'hex'),
      'issued', current_timestamp
    )
  $$,
  '23514', null,
  'rejects issued rows with claim fields'
);

select throws_ok(
  $$
    insert into public.session_student_bindings (
      session_id, token_digest, invited_email_digest, status, claimed_at
    )
    values (
      (select id from binding_test_sessions where slot = 3),
      decode(repeat('55', 32), 'hex'),
      decode(repeat('66', 32), 'hex'),
      'claimed', current_timestamp
    )
  $$,
  '23514', null,
  'rejects claimed rows without a student and claim actor'
);

select throws_ok(
  $$
    insert into public.session_student_bindings (
      session_id, token_digest, invited_email_digest, status, revoked_at
    )
    values (
      (select id from binding_test_sessions where slot = 4),
      decode(repeat('77', 32), 'hex'),
      decode(repeat('88', 32), 'hex'),
      'revoked', current_timestamp
    )
  $$,
  '23514', null,
  'rejects revoked rows without a revoke actor'
);

select case
  when exists (select 1 from binding_test_students) then lives_ok(
    format($sql$
      insert into public.session_student_bindings (
        session_id, student_id, token_digest, invited_email_digest,
        status, claimed_at, claimed_by, created_at, expires_at
      ) values (
        (select id from binding_test_sessions where slot = 5),
        %L,
        decode(repeat('99', 32), 'hex'),
        decode(repeat('aa', 32), 'hex'),
        'claimed',
        timestamp with time zone '2030-01-01 00:00:00+00',
        %L,
        timestamp with time zone '2029-12-31 00:00:00+00',
        timestamp with time zone '2030-01-01 00:00:00+00'
      )
    $sql$, (select id from binding_test_students), (select id from binding_test_students)),
    'accepts a valid claimed row'
  ) else skip(1, 'requires an existing student profile fixture')
end;

select lives_ok(
  $$
    insert into public.session_student_bindings (
      session_id, token_digest, invited_email_digest, status,
      created_at, expires_at
    ) values (
      (select id from binding_test_sessions where slot = 6),
      decode(repeat('bb', 32), 'hex'),
      decode(repeat('cc', 32), 'hex'),
      'expired',
      timestamp with time zone '2029-12-31 00:00:00+00',
      timestamp with time zone '2030-01-01 00:00:00+00'
    )
  $$,
  'accepts a valid expired row'
);

select case
  when exists (select 1 from public.profiles) then lives_ok(
    format($sql$
      insert into public.session_student_bindings (
        session_id, token_digest, invited_email_digest, status,
        revoked_at, revoked_by, created_at, expires_at
      ) values (
        (select id from binding_test_sessions where slot = 7),
        decode(repeat('dd', 32), 'hex'),
        decode(repeat('ee', 32), 'hex'),
        'revoked',
        timestamp with time zone '2030-01-01 00:00:00+00',
        %L,
        timestamp with time zone '2029-12-31 00:00:00+00',
        timestamp with time zone '2030-01-01 00:00:00+00'
      )
    $sql$, (select id from public.profiles limit 1)),
    'accepts a valid revoked row'
  ) else skip(1, 'requires an existing profile fixture')
end;

select throws_ok(
  $$
    insert into public.session_student_bindings (session_id, token_digest, invited_email_digest)
    values (
      (select id from binding_test_sessions where slot = 1),
      decode(repeat('12', 32), 'hex'),
      decode(repeat('13', 32), 'hex')
    )
  $$,
  '23505', null,
  'rejects a duplicate session binding'
);

select throws_ok(
  $$
    insert into public.session_student_bindings (session_id, token_digest, invited_email_digest)
    values (
      (select id from binding_test_sessions where slot = 2),
      decode(repeat('11', 32), 'hex'),
      decode(repeat('14', 32), 'hex')
    )
  $$,
  '23505', null,
  'rejects a duplicate token digest'
);

select throws_ok(
  $$
    insert into public.session_student_bindings (session_id, token_digest, invited_email_digest)
    values (
      (select id from binding_test_sessions where slot = 8),
      decode(repeat('11', 31), 'hex'),
      decode(repeat('22', 32), 'hex')
    )
  $$,
  '23514', null,
  'rejects a token digest that is not SHA-256 length'
);

select throws_ok(
  $$
    insert into public.session_student_bindings (session_id, token_digest, invited_email_digest)
    values (
      (select id from binding_test_sessions where slot = 8),
      decode(repeat('23', 32), 'hex'),
      decode(repeat('22', 31), 'hex')
    )
  $$,
  '23514', null,
  'rejects an invited email digest that is not SHA-256 length'
);

select case
  when exists (select 1 from binding_test_students) then lives_ok(
    format($sql$
      insert into public.session_student_bindings (
        session_id, student_id, token_digest, invited_email_digest,
        status, claimed_at, claimed_by, created_at, expires_at
      ) values
        (
          (select id from binding_test_sessions where slot = 9), %L,
          decode(repeat('24', 32), 'hex'), decode(repeat('25', 32), 'hex'),
          'claimed', timestamp with time zone '2030-01-01 00:00:00+00', %L,
          timestamp with time zone '2029-12-31 00:00:00+00',
          timestamp with time zone '2030-01-01 00:00:00+00'
        ),
        (
          (select id from binding_test_sessions where slot = 10), %L,
          decode(repeat('26', 32), 'hex'), decode(repeat('27', 32), 'hex'),
          'claimed', timestamp with time zone '2030-01-01 00:00:00+00', %L,
          timestamp with time zone '2029-12-31 00:00:00+00',
          timestamp with time zone '2030-01-01 00:00:00+00'
        )
    $sql$,
      (select id from binding_test_students), (select id from binding_test_students),
      (select id from binding_test_students), (select id from binding_test_students)),
    'allows one student to claim multiple different sessions'
  ) else skip(1, 'requires an existing student profile fixture')
end;

select is(
  (select status from public.sessions where id = (select id from binding_test_sessions where slot = 1)),
  'invited',
  'does not modify an existing session row'
);

select is(
  (select parent_id from public.sessions where id = (select id from binding_test_sessions where slot = 1)),
  null::uuid,
  'leaves an existing unowned session unowned'
);

select results_eq(
  $$
    select indexname::text
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'session_student_bindings'
    order by indexname
  $$,
  $$
    values
      ('session_student_bindings_claimed_by_idx'::text),
      ('session_student_bindings_lifecycle_idx'::text),
      ('session_student_bindings_pkey'::text),
      ('session_student_bindings_revoked_by_idx'::text),
      ('session_student_bindings_session_id_key'::text),
      ('session_student_bindings_session_id_student_id_key'::text),
      ('session_student_bindings_student_id_idx'::text),
      ('session_student_bindings_token_digest_key'::text)
  $$,
  'creates the required binding and lifecycle indexes'
);

select * from finish();

rollback;
