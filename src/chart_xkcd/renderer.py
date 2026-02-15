"""HTML renderer for chart.xkcd charts."""

import json
from pathlib import Path

from .charts import _BaseChart

_TEMPLATE = """\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
</head>
<body>
<div style="width:{width}px;height:{height}px;margin:0 auto;">
<svg class="chart"></svg>
</div>
<script type="module">
import {{ {chart_type} }} from '{chart_js_url}';
var svg = document.querySelector('.chart');
new {chart_type}(svg, {config});
</script>
</body>
</html>
"""


def to_html(
    chart: _BaseChart,
    chart_js_url: str,
    width: int = 600,
    height: int = 400,
) -> str:
    """Return HTML for a chart as a string.

    Args:
        chart: chart to convert.
        chart_js_url: URL to load the chart.xkcd JavaScript module from.
        width: chart width in pixels.
        height: chart height in pixels.

    Returns:
        HTML as text.
    """
    chart_type = type(chart).__name__
    config = json.dumps(chart.to_dict(), indent=2)
    return _TEMPLATE.format(
        title=chart.title or "",
        chart_js_url=chart_js_url,
        width=width,
        height=height,
        chart_type=chart_type,
        config=config,
    )


def render(
    chart: _BaseChart,
    output_path: Path | str,
    chart_js_url: str,
    width: int = 600,
    height: int = 400,
) -> None:
    """Render a chart to an HTML file.

    Args:
        chart: chart to render.
        output_path: where to write result.
        chart_js_url: URL to load the chart.xkcd JavaScript module from.
        width: chart width in pixels.
        height: chart height in pixels.
    """
    Path(output_path).write_text(
        to_html(chart, chart_js_url=chart_js_url, width=width, height=height)
    )
