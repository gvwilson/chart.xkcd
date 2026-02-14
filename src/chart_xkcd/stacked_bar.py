"""Stacked bar chart."""

from typing import Any
from .charts import _AxisChart, _check_labels_datasets


class StackedBar(_AxisChart):
    """Stacked bar chart showing cumulative data across categories.

    Supports multiple datasets rendered as vertically stacked segments.

    Args:
        title: Chart title.
        x_label: Label for the x-axis.
        y_label: Label for the y-axis.
        labels: Category names for the x-axis.
        datasets: List of dataset dicts, each with `data` (list of numeric
            values) and `label` (str) keys.
        options: Dict of chart options:
            - `yTickCount` (int): Number of y-axis ticks (default 3).
            - `legendPosition` (int): Legend placement (use `positionType`).
            - `showLegend` (bool): Show legend (default True).
            - `dataColors` (list[str]): Segment colors.
            - `fontFamily` (str): Font family (default `'xkcd'`).
            - `strokeColor` (str): Axis/border color (default `'black'`).
            - `backgroundColor` (str): Background color (default `'white'`).
            - `unxkcdify` (bool): Disable hand-drawn style (default False).

    Example::

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
