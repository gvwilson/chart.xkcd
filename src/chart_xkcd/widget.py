"""anywidget-based chart widget for use in marimo and Jupyter notebooks."""

import json
from importlib.resources import files

import anywidget
import traitlets

_WIDGET_JS = files("chart_xkcd").joinpath("static", "widget.js")


class ChartWidget(anywidget.AnyWidget):
    """anywidget wrapper around chart.xkcd."""

    _esm = _WIDGET_JS
    config = traitlets.Unicode("{}").tag(sync=True)
    chart_type = traitlets.Unicode("Bar").tag(sync=True)
    width = traitlets.Int(600).tag(sync=True)
    height = traitlets.Int(400).tag(sync=True)


def to_widget(chart, width=600, height=400):
    """Convert a chart object to an anywidget for display in marimo or Jupyter.

    Args:
        chart: a chart object (Bar, Line, Pie, etc.).
        width: chart width in pixels.
        height: chart height in pixels.

    Returns:
        A ChartWidget instance.
    """
    return ChartWidget(
        config=json.dumps(chart.to_dict()),
        chart_type=type(chart).__name__,
        width=width,
        height=height,
    )
