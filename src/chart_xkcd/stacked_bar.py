"""Stacked bar chart."""

from typing import Any
from .charts import _AxisChart, _check_labels_datasets


class StackedBar(_AxisChart):
    """Stacked bar chart showing cumulative data across categories.

    Supports multiple datasets rendered as vertically stacked segments.
    Set ``normalize=True`` for a 100% stacked bar chart.

    Args:
        title: Chart title.
        x_label: Label for the x-axis.
        y_label: Label for the y-axis.
        labels: Category names for the x-axis.
        datasets: List of dataset dicts, each with ``data`` (list of numeric
            values) and ``label`` (str) keys.
        options: Dict of chart options.

    Options:

    - ``backgroundColor`` (str): Background color (default ``'white'``).
    - ``dataColors`` (list[str]): Segment colors.
    - ``fontFamily`` (str): Font family (default ``'xkcd'``).
    - ``legendPosition`` (int): Legend placement (use ``positionType``).
    - ``normalize`` (bool): Scale each column to 100% (default False).
    - ``showLegend`` (bool): Show legend (default True).
    - ``strokeColor`` (str): Axis/border color (default ``'black'``).
    - ``unxkcdify`` (bool): Disable hand-drawn style (default False).
    - ``yMin`` (float): Minimum y-axis value (default 0).
    - ``yMax`` (float): Maximum y-axis value (default data max or 100 when
      ``normalize=True``).
    - ``yTickCount`` (int): Number of y-axis ticks (default 3).

    Example — stacked::

        StackedBar(
            title="Inventory",
            x_label="Quarter",
            y_label="Units",
            labels=["Q1", "Q2", "Q3"],
            datasets=[
                {"data": [10, 20, 30], "label": "Widgets"},
                {"data": [5, 15, 10], "label": "Gadgets"},
            ],
        )

    Example — 100% stacked::

        StackedBar(
            title="Market Share",
            labels=["2022", "2023", "2024"],
            datasets=[
                {"data": [40, 45, 50], "label": "Product A"},
                {"data": [60, 55, 50], "label": "Product B"},
            ],
            options={"normalize": True, "yTickCount": 5},
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
        _check_labels_datasets(labels, datasets, "StackedBar")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )
