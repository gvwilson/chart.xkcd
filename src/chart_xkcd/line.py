"""Line chart."""

from typing import Any
from .charts import _AxisChart, _check_labels_datasets


class Line(_AxisChart):
    """Line chart for continuous data with one or more lines.

    Args:
        title: Chart title.
        x_label: Label for the x-axis.
        y_label: Label for the y-axis.
        labels: X-axis category labels.
        datasets: List of dataset dicts, each with `data` (list of numeric
            values), `label` (str), and an optional `color` (str) key.
        options: Dict of chart options:
            - `yTickCount` (int): Number of y-axis ticks (default 3).
            - `legendPosition` (int): Legend placement (use `positionType`).
            - `showLegend` (bool): Show legend (default True).
            - `dataColors` (list[str]): Line colors.
            - `fontFamily` (str): Font family (default `'xkcd'`).
            - `strokeColor` (str): Axis/border color (default `'black'`).
            - `backgroundColor` (str): Background color (default `'white'`).
            - `unxkcdify` (bool): Disable hand-drawn style (default False).

    Example::

        Line(
            title="Temperature",
            x_label="Day",
            y_label="Degrees",
            labels=["Mon", "Tue", "Wed", "Thu"],
            datasets=[
                {"data": [65, 70, 68, 72], "label": "NYC"},
                {"data": [80, 82, 79, 85], "label": "LA"},
            ],
        )
    """

    def __init__(
        self,
        *,
        title: str | None = None,
        x_label: str | None = None,
        y_label: str | None = None,
        labels: Any,
        datasets: Any,
        options: Any = None,
    ):
        _check_labels_datasets(labels, datasets, "Line")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )
