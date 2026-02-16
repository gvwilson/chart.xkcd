.mode csv
.headers on
select coalesce(variety, "unknown") as variety, count(*) as num
from specimen
group by variety;
