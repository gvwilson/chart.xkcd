.mode csv
.headers on
select mass, diameter, variety
from specimen
where variety is not null
limit 30;
