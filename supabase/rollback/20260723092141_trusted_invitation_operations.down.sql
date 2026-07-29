begin;

-- No automatic rollback: removing trusted RPCs while leaving their sessions,
-- bindings, profiles, and assessment rows would create an unsafe partial state.
-- Use a reviewed forward migration or restore a verified backup instead.

commit;
