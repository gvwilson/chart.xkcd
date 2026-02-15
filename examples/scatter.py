"""Example: XY scatter chart."""

import sys
from chart_xkcd import Scatter, positionType, render

chart = Scatter(
    title="Pokemon Comparison",
    x_label="Attack",
    y_label="Defense",
    datasets=[
        {
            "label": "February",
            "data": [
                {"x": 50, "y": 60},
                {"x": 70, "y": 80},
                {"x": 90, "y": 50},
                {"x": 40, "y": 70},
            ],
        },
        {
            "label": "March",
            "data": [
                {"x": 60, "y": 55},
                {"x": 80, "y": 90},
                {"x": 30, "y": 40},
                {"x": 100, "y": 65},
            ],
        },
    ],
    options={
        "xTickCount": 5,
        "yTickCount": 5,
        "showLine": False,
        "legendPosition": positionType.upRight,
    },
)

render(chart, sys.argv[1], chart_js_url="/src/chart_xkcd/static/chart.xkcd.js")
