"""chart_xkcd: Python API for generating xkcd-style charts.

Provides six chart classes (Bar, Line, Pie, Radar, Scatter, StackedBar)
that mirror the chart.xkcd JavaScript library. Charts can be:

- Rendered as standalone HTML files via ``render()`` / ``to_html()``.
- Displayed in Jupyter or marimo notebooks via ``to_widget()``.

All chart classes accept a ``title``, ``data`` (labels and datasets),
and an ``options`` dict. Axis-based charts also accept ``x_label``
and ``y_label``. See individual class docstrings for details.
"""

from importlib.metadata import PackageNotFoundError, version

try:
    __version__ = version("chart-xkcd")
except PackageNotFoundError:
    __version__ = "unknown"

from .bar import Bar as Bar
from .line import Line as Line
from .pie import Pie as Pie
from .radar import Radar as Radar
from .scatter import Scatter as Scatter
from .stacked_bar import StackedBar as StackedBar
from .config import positionType as positionType
from .renderer import render as render, to_html as to_html
from .widget import to_widget as to_widget
