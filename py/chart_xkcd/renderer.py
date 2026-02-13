"""HTML renderer for chart.xkcd charts."""

import json
from pathlib import Path

_TEMPLATE = """\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="{chart_js_url}"></script>
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


def render(
    chart,
    output_path,
    chart_js_url="https://cdn.jsdelivr.net/npm/chart.xkcd@1.1/dist/chart.xkcd.min.js",
    width=600,
    height=400,
):
    """Render a chart to a self-contained HTML file."""
    chart_type = type(chart).__name__
    config = json.dumps(chart.to_dict(), indent=2)
    html = _TEMPLATE.format(
        title=chart.title or "",
        chart_js_url=chart_js_url,
        width=width,
        height=height,
        chart_type=chart_type,
        config=config,
    )
    Path(output_path).write_text(html)
