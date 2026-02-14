"""HTML renderer for chart.xkcd charts."""

import json
from importlib.resources import files
from pathlib import Path

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


def render(
    chart,
    output_path,
    chart_js_url=None,
    width=600,
    height=400,
):
    """Render a chart to a self-contained HTML file.

    If chart_js_url is provided, the HTML will load the JS from that URL.
    Otherwise, the bundled JS is inlined directly into the HTML.
    """
    if chart_js_url:
        script_tag = f'<script src="{chart_js_url}"></script>'
    else:
        script_tag = f"<script>{_bundled_js()}</script>"

    chart_type = type(chart).__name__
    config = json.dumps(chart.to_dict(), indent=2)
    html = _TEMPLATE.format(
        title=chart.title or "",
        script_tag=script_tag,
        width=width,
        height=height,
        chart_type=chart_type,
        config=config,
    )
    Path(output_path).write_text(html)
