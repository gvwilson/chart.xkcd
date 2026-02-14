"""chart_xkcd: Python API for generating xkcd-style charts."""

from .charts import Bar as Bar, Line as Line, Pie as Pie, Radar as Radar, StackedBar as StackedBar, XY as XY
from .config import positionType as positionType
from .renderer import render as render
