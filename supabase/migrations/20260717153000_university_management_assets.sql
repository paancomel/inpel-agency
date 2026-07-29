begin;

alter table public.universities
  add column representative_id uuid default auth.uid(),
  add constraint universities_representative_id_fkey
    foreign key (representative_id) references public.profiles (id) on delete set null;

create unique index universities_representative_id_key
  on public.universities (representative_id)
  where representative_id is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'university-assets',
  'university-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.universities enable row level security;
alter table public.courses enable row level security;
alter table public.gallery_images enable row level security;

create or replace function public.is_portal_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_portal_admin() from public;
grant execute on function public.is_portal_admin() to authenticated;

create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_portal_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_portal_admin())
  with check (id = auth.uid() or public.is_portal_admin());

create policy "universities_public_read"
  on public.universities for select to anon, authenticated
  using (true);

create policy "universities_owner_insert"
  on public.universities for insert to authenticated
  with check (representative_id = auth.uid() or public.is_portal_admin());

create policy "universities_owner_update"
  on public.universities for update to authenticated
  using (representative_id = auth.uid() or public.is_portal_admin())
  with check (representative_id = auth.uid() or public.is_portal_admin());

create policy "universities_owner_delete"
  on public.universities for delete to authenticated
  using (representative_id = auth.uid() or public.is_portal_admin());

create policy "courses_public_read"
  on public.courses for select to anon, authenticated
  using (true);

create policy "courses_owner_insert"
  on public.courses for insert to authenticated
  with check (exists (
    select 1 from public.universities
    where id = university_id
      and (representative_id = auth.uid() or public.is_portal_admin())
  ));

create policy "courses_owner_update"
  on public.courses for update to authenticated
  using (exists (
    select 1 from public.universities
    where id = university_id
      and (representative_id = auth.uid() or public.is_portal_admin())
  ))
  with check (exists (
    select 1 from public.universities
    where id = university_id
      and (representative_id = auth.uid() or public.is_portal_admin())
  ));

create policy "courses_owner_delete"
  on public.courses for delete to authenticated
  using (exists (
    select 1 from public.universities
    where id = university_id
      and (representative_id = auth.uid() or public.is_portal_admin())
  ));

create policy "gallery_images_public_read"
  on public.gallery_images for select to anon, authenticated
  using (true);

create policy "gallery_images_owner_insert"
  on public.gallery_images for insert to authenticated
  with check (exists (
    select 1 from public.universities
    where id = university_id
      and (representative_id = auth.uid() or public.is_portal_admin())
  ));

create policy "gallery_images_owner_update"
  on public.gallery_images for update to authenticated
  using (exists (
    select 1 from public.universities
    where id = university_id
      and (representative_id = auth.uid() or public.is_portal_admin())
  ))
  with check (exists (
    select 1 from public.universities
    where id = university_id
      and (representative_id = auth.uid() or public.is_portal_admin())
  ));

create policy "gallery_images_owner_delete"
  on public.gallery_images for delete to authenticated
  using (exists (
    select 1 from public.universities
    where id = university_id
      and (representative_id = auth.uid() or public.is_portal_admin())
  ));

create policy "university_assets_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'university-assets');

create policy "university_assets_owner_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'university-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.universities
      where id::text = (storage.foldername(name))[2]
        and (representative_id = auth.uid() or public.is_portal_admin())
    )
  );

create policy "university_assets_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'university-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.universities
      where id::text = (storage.foldername(name))[2]
        and (representative_id = auth.uid() or public.is_portal_admin())
    )
  )
  with check (
    bucket_id = 'university-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "university_assets_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'university-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.universities
      where id::text = (storage.foldername(name))[2]
        and (representative_id = auth.uid() or public.is_portal_admin())
    )
  );

commit;
