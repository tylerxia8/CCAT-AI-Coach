create policy "users delete own profile"
on public.profiles for delete
using (auth.uid() = id);

create or replace function public.delete_my_learning_data()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  deleted_sessions integer := 0;
  deleted_events integer := 0;
  deleted_profiles integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Events without a session are not covered by session cascades.
  delete from public.telemetry_events where user_id = current_user_id;
  get diagnostics deleted_events = row_count;

  -- Attempts and diagnostic summaries cascade from their owning session.
  delete from public.sessions where user_id = current_user_id;
  get diagnostics deleted_sessions = row_count;

  delete from public.profiles where id = current_user_id;
  get diagnostics deleted_profiles = row_count;

  return jsonb_build_object(
    'deleted_sessions', deleted_sessions,
    'deleted_events', deleted_events,
    'deleted_profiles', deleted_profiles
  );
end;
$$;

revoke all on function public.delete_my_learning_data() from public;
grant execute on function public.delete_my_learning_data() to authenticated;
