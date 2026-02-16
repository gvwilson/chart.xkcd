"""Example: Radar chart."""

import csv
import sys
from chart_xkcd import Radar, positionType, render

if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} /path/to/data.csv /path/to/chart.html")
    sys.exit(1)

with open(sys.argv[1]) as reader:
    rows = list(csv.DictReader(reader))

grids = sorted(set(r["grid"] for r in rows))
varieties = sorted(set(r["variety"] for r in rows))
lookup = {(r["variety"], r["grid"]): int(r["num"]) for r in rows}

chart = Radar(
    title="Samples by Variety and Grid",
    labels=grids,
    datasets=[
        {"label": v, "data": [lookup[(v, g)] for g in grids]} for v in varieties
    ],
    options={
        "showLabels": True,
        "showLegend": True,
        "dotSize": 0.8,
        "legendPosition": positionType.upRight,
    },
)

render(chart, sys.argv[2], chart_js_url="/src/chart_xkcd/static/chart.xkcd.js")
