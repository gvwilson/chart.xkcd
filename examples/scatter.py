"""Example: Scatter chart."""

import csv
import sys
from chart_xkcd import Scatter, positionType, render

if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} /path/to/data.csv /path/to/chart.html")
    sys.exit(1)

with open(sys.argv[1]) as reader:
    rows = list(csv.DictReader(reader))

varieties = sorted(set(r["variety"] for r in rows))

chart = Scatter(
    title="Snail Mass vs Diameter",
    x_label="Mass (g)",
    y_label="Diameter (mm)",
    datasets=[
        {
            "label": v,
            "data": [
                {"x": float(r["mass"]), "y": float(r["diameter"])}
                for r in rows
                if r["variety"] == v
            ],
        }
        for v in varieties
    ],
    options={
        "showLine": False,
        "legendPosition": positionType.upLeft,
    },
)

render(chart, sys.argv[2], chart_js_url="/src/chart_xkcd/static/chart.xkcd.js")
