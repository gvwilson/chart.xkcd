"""Example: Heatmap chart."""

import csv
import sys
from chart_xkcd import Heatmap, render

if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} /path/to/grid.csv /path/to/chart.html")
    sys.exit(1)

with open(sys.argv[1]) as _f:
    _reader = csv.reader(_f)
    _matrix = [[float(v) for v in row] for row in _reader]

_n_rows = len(_matrix)
_n_cols = len(_matrix[0]) if _matrix else 0

chart = Heatmap(
    title="Grid Values",
    x_label="Column",
    y_label="Row",
    x_labels=[str(i) for i in range(_n_cols)],
    y_labels=[str(i) for i in range(_n_rows)],
    datasets=[{"data": _matrix}],
)

render(chart, sys.argv[2], chart_js_url="/src/chart_xkcd/static/chart.xkcd.js")
