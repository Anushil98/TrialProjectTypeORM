create or replace function total_follow() returns integer as $total$
declare total integer;
begin
select count(8) into total
from follow;
return total;
end;
$total$ language plpgsql;