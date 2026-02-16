.mode csv
.headers on
select strftime('%Y-%W', performed) AS week, count(*) as num
from assay
where week is not null
group by week;
