.mode csv
.headers on
select specimen.variety, grid_cells.grid_id as grid, count(*) as num
from specimen join grid_cells
on specimen.lat = grid_cells.lat and specimen.lon = grid_cells.lon
where specimen.variety is not null
group by specimen.variety, grid_cells.grid_id;
