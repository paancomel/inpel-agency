begin;

set local search_path = public, extensions;

select plan(14);

select has_table('public', 'reference_institutions', 'creates a private-by-policy reference institution catalogue');
select has_table('public', 'reference_programmes', 'creates source programmes separately from courses');
select has_table('public', 'nec_classifications', 'stores NEC taxonomy once');
select has_table('public', 'reference_institution_links', 'requires reviewed institution links');
select has_table('public', 'reference_programme_links', 'requires reviewed programme links');
select has_table('public', 'portal_catalog_visibility', 'makes portal publication explicit');
select col_is_pk('public', 'reference_programmes', 'canonical_record_id', 'canonical source record is the programme identity');
select has_index('public', 'reference_programmes', 'reference_programmes_reference_no_idx', 'reference numbers remain searchable without a unique constraint');
select is((select relrowsecurity from pg_class where oid = 'public.reference_programmes'::regclass), true, 'reference programmes enforce RLS');
select is((select relrowsecurity from pg_class where oid = 'public.portal_catalog_visibility'::regclass), true, 'portal visibility enforces RLS');
select has_view('public', 'inpolor_catalog_institutions', 'provides an INPOLOR-safe institution projection');
select has_view('public', 'inpolor_catalog_programmes', 'provides an INPOLOR-safe programme projection');
select has_view('public', 'shared_catalog_institutions', 'provides one source-backed institution read model for all portals');
select has_view('public', 'shared_catalog_programmes', 'provides one source-backed programme read model for all portals');

select * from finish();

rollback;
