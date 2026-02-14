"""Example: Pie chart."""

import sys
from chart_xkcd import Pie, positionType, render

chart = Pie(
    title="What Tim Is Made Of",
    labels=["Code", "Coffee", "Sleep", "Snacks"],
    datasets=[{"data": [500, 200, 80, 90]}],
    options={
        "innerRadius": 0.5,
        "legendPosition": positionType.upRight,
    },
)

render(chart, sys.argv[1])
