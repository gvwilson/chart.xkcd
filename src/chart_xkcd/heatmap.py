"""Heatmap chart."""

from typing import Any
from .charts import _AxisChart


class Heatmap(_AxisChart):
    """Heatmap with two categorical axes and color-encoded cell values.

    Cell fill opacity is scaled from the data minimum to maximum so lighter
    cells represent lower values and darker cells represent higher values.

    Args:
        title: Chart title.
        x_label: Label for the x-axis (column axis).
        y_label: Label for the y-axis (row axis).
        x_labels: Column (x-axis) category names.
        y_labels: Row (y-axis) category names.
        datasets: List containing one dataset dict with a ``data`` key
            holding a 2-D list shaped ``[rowIndex][colIndex]`` that matches
            ``y_labels`` × ``x_labels``.
        options: Dict of chart options.

    Options:

    - ``backgroundColor`` (str): Background color (default ``'white'``).
    - ``cellPadding`` (float): Fractional gap between cells (default 0.05).
    - ``dataColors`` (list[str]): Cell colors; the first color is used.
    - ``fontFamily`` (str): Font family (default ``'xkcd'``).
    - ``maxOpacity`` (float): Cell opacity at the maximum value (default 0.92).
    - ``minOpacity`` (float): Cell opacity at the minimum value (default 0.08).
    - ``strokeColor`` (str): Axis/border color (default ``'black'``).
    - ``unxkcdify`` (bool): Disable hand-drawn style (default False).

    Example::

        Heatmap(
            title="Weekly Activity",
            x_label="Day",
            y_label="Hour",
            x_labels=["Mon", "Tue", "Wed", "Thu", "Fri"],
            y_labels=["9am", "12pm", "3pm", "6pm"],
            datasets=[{
                "data": [
                    [3, 7, 5, 2, 6],   # 9am
                    [8, 4, 9, 1, 3],   # 12pm
                    [2, 6, 4, 8, 5],   # 3pm
                    [1, 3, 2, 7, 4],   # 6pm
                ]
            }],
        )
    """

    def __init__(
        self,
        *,
        title: str | None = None,
        x_label: str | None = None,
        y_label: str | None = None,
        x_labels: Any,
        y_labels: Any,
        datasets: Any,
        options: Any = None,
    ):
        if not isinstance(x_labels, (list, tuple)):
            raise TypeError("Heatmap: x_labels must be a list")
        if not isinstance(y_labels, (list, tuple)):
            raise TypeError("Heatmap: y_labels must be a list")
        if not isinstance(datasets, (list, tuple)) or len(datasets) == 0:
            raise ValueError("Heatmap: datasets must be a non-empty list")
        ds = datasets[0]
        if not isinstance(ds, dict) or "data" not in ds:
            raise ValueError("Heatmap: datasets[0] must be a dict with a 'data' key")
        if len(ds["data"]) != len(y_labels):
            raise ValueError(
                f"Heatmap: datasets[0].data has {len(ds['data'])} rows "
                f"but y_labels has {len(y_labels)} entries"
            )
        for i, row in enumerate(ds["data"]):
            if len(row) != len(x_labels):
                raise ValueError(
                    f"Heatmap: datasets[0].data[{i}] has {len(row)} values "
                    f"but x_labels has {len(x_labels)} entries"
                )
        data = {
            "labels": list(x_labels),
            "yLabels": list(y_labels),
            "datasets": list(datasets),
        }
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )
