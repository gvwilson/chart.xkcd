"""Example: Bar chart."""

import sys
from chart_xkcd import Bar, render

chart = Bar(
    title="Github Stars vs Patron Count",
    x_label="Project",
    y_label="Count",
    labels=["chart.xkcd", "star-history", "tomato-pie"],
    datasets=[{"data": [2100, 430, 90]}],
)

render(chart, sys.argv[1], chart_js_url="/src/chart_xkcd/static/chart.xkcd.min.js")
