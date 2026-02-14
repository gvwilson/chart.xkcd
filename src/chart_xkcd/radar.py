"""Radar chart."""

from typing import Any
from .charts import _BaseChart, _check_labels_datasets


class Radar(_BaseChart):
    """Radar/spider chart for multi-dimensional data.

    Each label defines an axis radiating from the center.  Multiple
    datasets are rendered as overlapping polygons.

    Args:
        title: Chart title.
        labels: Axis labels (dimension names).
        datasets: List of dataset dicts, each with `data` (list of numeric
            values, one per label), `label` (str), and an optional
            `color` (str) key.
        options: Dict of chart options:
            - `showLabels` (bool): Show axis labels (default False).
            - `ticksCount` (int): Number of grid rings (default 3).
            - `dotSize` (float): Point size multiplier (default 1).
            - `legendPosition` (int): Legend placement (use `positionType`).
            - `showLegend` (bool): Show legend (default False).
            - `dataColors` (list[str]): Dataset colors.
            - `fontFamily` (str): Font family (default `'xkcd'`).
            - `strokeColor` (str): Grid/border color (default `'black'`).
            - `backgroundColor` (str): Background color (default `'white'`).
            - `unxkcdify` (bool): Disable hand-drawn style (default False).

    Example::

        Radar(
            title="Skills",
            labels=["JavaScript", "Python", "Go", "Rust", "SQL"],
            datasets=[
                {"data": [8, 9, 5, 3, 7], "label": "Developer A"},
                {"data": [6, 7, 8, 6, 5], "label": "Developer B"},
            ],
            options={"showLabels": True, "showLegend": True},
        )
    """

    def __init__(
        self,
        *,
        title: str | None = None,
        labels: Any,
        datasets: Any,
        options: Any = None,
    ):
        _check_labels_datasets(labels, datasets, "Radar")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(title=title, data=data, options=options)
