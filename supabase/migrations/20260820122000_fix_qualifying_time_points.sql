-- Correct the authoritative scoring function without changing its contract.
-- The function is already exposed by Supabase as:
-- public.calculate_qualifying_time_points(numeric, numeric) -> integer
--
-- Apply this migration through the project's authorized Supabase migration
-- workflow. It is intentionally not executed against the Replit database.

create or replace function public.calculate_qualifying_time_points(
  p_predicted numeric,
  p_actual numeric
)
returns integer
language plpgsql
immutable
as $function$
declare
  v_absolute_error numeric;
  v_relative_error numeric;
begin
  if p_predicted is null or p_actual is null or p_actual <= 0 then
    return 0;
  end if;

  v_absolute_error := abs(p_predicted - p_actual);
  v_relative_error := v_absolute_error / p_actual;

  -- The absolute 10-point band is inclusive and must be checked first.
  if v_absolute_error <= 0.010 then
    return 10;
  elsif v_relative_error <= 0.001 then
    return 5;
  elsif v_relative_error <= 0.0025 then
    return 3;
  elsif v_relative_error <= 0.005 then
    return 1;
  end if;

  return 0;
end;
$function$;