"""Example: Radar chart."""

import sys
from chart_xkcd import Radar, positionType, render

chart = Radar(
    title="Developer Skills",
    labels=["JavaScript", "Python", "Go", "Rust", "SQL"],
    datasets=[
        {"label": "Developer A", "data": [8, 9, 5, 3, 7]},
        {"label": "Developer B", "data": [6, 7, 8, 6, 5]},
    ],
    options={
        "showLabels": True,
        "showLegend": True,
        "dotSize": 0.8,
        "legendPosition": positionType.upRight,
    },
)

render(chart, sys.argv[1])
