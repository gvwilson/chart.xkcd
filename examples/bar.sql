.mode csv
.headers on
select person.personal as name, count(*) as num
from assay join person
on assay.person_id = person.ident
group by person.ident;
