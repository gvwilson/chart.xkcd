"""Example: Stacked bar chart."""

import sys
from chart_xkcd import StackedBar, render

chart = StackedBar(
    title="Issues and PRs",
    x_label="Month",
    y_label="Count",
    labels=["Jan", "Feb", "Mar", "Apr", "May"],
    datasets=[
        {"label": "Issues", "data": [12, 19, 11, 29, 17]},
        {"label": "PRs", "data": [3, 5, 2, 4, 1]},
        {"label": "Merges", "data": [2, 3, 0, 1, 1]},
    ],
    options={"showLegend": True},
)

render(chart, sys.argv[1])
