"""Example: Line chart."""

import csv
import sys
from chart_xkcd import Line, render

if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} /path/to/data.csv /path/to/chart.html")
    sys.exit(1)

with open(sys.argv[1]) as reader:
    rows = list(csv.DictReader(reader))

chart = Line(
    title="Samples Collected per Week",
    x_label="Week",
    y_label="Count",
    labels=[r["week"] for r in rows],
    datasets=[{"label": "Samples", "data": [int(r["num"]) for r in rows]}],
)

render(chart, sys.argv[2], chart_js_url="/src/chart_xkcd/static/chart.xkcd.js")
