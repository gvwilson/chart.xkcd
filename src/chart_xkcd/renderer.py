"""HTML renderer for chart.xkcd charts."""

import json
from importlib.resources import files
from pathlib import Path
from .charts import _BaseChart

_TEMPLATE = """\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
{script_tag}
</head>
<body>
<div style="width:{width}px;height:{height}px;margin:0 auto;">
<svg class="chart"></svg>
</div>
<script>
(function() {{
  var svg = document.querySelector('.chart');
  new chartXkcd.{chart_type}(svg, {config});
}})();
</script>
</body>
</html>
"""


def _bundled_js():
    """Return the contents of the bundled chart.xkcd.min.js."""
    return (files("chart_xkcd") / "static" / "chart.xkcd.min.js").read_text(
        encoding="utf-8"
    )


def to_html(
    chart: _BaseChart,
    chart_js_url: str | None = None,
    width: int = 600,
    height: int = 400,
) -> str:
    """Return self-contained HTML for a chart as a string.

    If chart_js_url is provided, the HTML will load the JS from that URL.
    Otherwise, the bundled JS is inlined directly into the HTML.

    Args:
        chart: chart to convert.
        chart_js_url: URL to load JavaScript from. If missing, JS is inlined.
        width: chart width in pixels.
        height: chart height in pixels.

    Returns:
        HTML as text.
    """
    if chart_js_url:
        script_tag = f'<script src="{chart_js_url}"></script>'
    else:
        script_tag = f"<script>{_bundled_js()}</script>"

    chart_type = type(chart).__name__
    config = json.dumps(chart.to_dict(), indent=2)
    return _TEMPLATE.format(
        title=chart.title or "",
        script_tag=script_tag,
        width=width,
        height=height,
        chart_type=chart_type,
        config=config,
    )


def render(
    chart: _BaseChart,
    output_path: Path | str,
    chart_js_url: str | None = None,
    width: int = 600,
    height: int = 400,
) -> None:
    """Render a chart to a self-contained HTML file.

    If chart_js_url is provided, the HTML will load the JS from that URL.
    Otherwise, the bundled JS is inlined directly into the HTML.

    Args:
        chart: chart to render.
        output_path: where to write result.
        chart_js_url: URL to load JavaScript from. If missing, JS is inlined.
        width: chart width in pixels.
        height: chart height in pixels.
    """
    Path(output_path).write_text(
        to_html(chart, chart_js_url=chart_js_url, width=width, height=height)
    )
