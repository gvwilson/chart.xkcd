"""Example: Bar chart."""

import csv
import sys
from chart_xkcd import Bar, render

if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} /path/to/data.csv /path/to/chart.html")
    sys.exit(1)

with open(sys.argv[1]) as reader:
    rows = list(csv.DictReader(reader))

chart = Bar(
    title="Samples per Person",
    x_label="Person",
    y_label="Count",
    labels=[r["name"] for r in rows],
    datasets=[{"data": [int(r["num"]) for r in rows]}],
)

render(chart, sys.argv[2], chart_js_url="/src/chart_xkcd/static/chart.xkcd.js")
