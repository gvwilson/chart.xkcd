"""Pie chart."""

from typing import Any
from .charts import _BaseChart, _check_labels_datasets


class Pie(_BaseChart):
    """Pie/donut chart.

    Uses a single dataset. Only `datasets[0]` is rendered.

    Args:
        title: Chart title.
        labels: Slice labels.
        datasets: List containing one dataset dict with a `data` key
            (list of numeric values).
        options: Dict of chart options.

    Options:

    - `backgroundColor` (str): Background color (default `'white'`).
    - `dataColors` (list[str]): Slice colors.
    - `fontFamily` (str): Font family (default `'xkcd'`).
    - `innerRadius` (float): 0 for pie, 0.5 for donut (default 0.5).
    - `legendPosition` (int): Legend placement (use `positionType`).
    - `showLegend` (bool): Show legend (default True).
    - `strokeColor` (str): Border color (default `'black'`).
    - `unxkcdify` (bool): Disable hand-drawn style (default False).

    Example:

    ```
    Pie(
        title="Browser Share",
        labels=["Chrome", "Firefox", "Safari"],
        datasets=[{"data": [60, 20, 20]}],
        options={"innerRadius": 0.5},
    )
    ```
    """

    def __init__(
        self,
        *,
        title: str | None = None,
        labels: Any,
        datasets: Any,
        options: Any = None,
    ):
        _check_labels_datasets(labels, datasets, "Pie")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(title=title, data=data, options=options)
