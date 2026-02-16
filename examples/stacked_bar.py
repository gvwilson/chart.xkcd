"""Example: Stacked bar chart."""

import csv
import sys
from chart_xkcd import StackedBar, render

if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} /path/to/data.csv /path/to/chart.html")
    sys.exit(1)

with open(sys.argv[1]) as reader:
    rows = list(csv.DictReader(reader))

grids = sorted(set(r["grid"] for r in rows))
varieties = sorted(set(r["variety"] for r in rows))
lookup = {(r["variety"], r["grid"]): int(r["num"]) for r in rows}

chart = StackedBar(
    title="Samples by Variety and Grid",
    x_label="Grid",
    y_label="Count",
    labels=grids,
    datasets=[
        {"label": v, "data": [lookup[(v, g)] for g in grids]} for v in varieties
    ],
    options={"showLegend": True},
)

render(chart, sys.argv[2], chart_js_url="/src/chart_xkcd/static/chart.xkcd.js")
