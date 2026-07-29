begin;

revoke select on public.universities, public.courses, public.gallery_images from anon;
revoke select, insert, update, delete on public.universities, public.courses, public.gallery_images from authenticated;
revoke select, insert, update on public.profiles from authenticated;

commit;
