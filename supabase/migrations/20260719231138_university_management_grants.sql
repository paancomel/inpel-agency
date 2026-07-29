begin;

grant usage on schema public to anon, authenticated;

grant select on public.universities, public.courses, public.gallery_images to anon;
grant select, insert, update, delete on public.universities, public.courses, public.gallery_images to authenticated;
grant select, insert, update on public.profiles to authenticated;

commit;
