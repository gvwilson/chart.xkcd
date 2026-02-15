"""Bar chart."""

from typing import Any
from .charts import _AxisChart, _check_labels_datasets


class Bar(_AxisChart):
    """Bar chart with categorical x-axis.

    Uses a single dataset. Only `datasets[0]` is rendered.

    Args:
        title: Chart title.
        x_label: Label for the x-axis.
        y_label: Label for the y-axis.
        labels: Category names for the x-axis.
        datasets: List containing one dataset dict with a `data` key
            (list of numeric values) and an optional `label` key.
        options: Dict of chart options.

    Options:

    - `backgroundColor` (str): Background color (default `'white'`).
    - `dataColors` (list[str]): Bar colors.
    - `fontFamily` (str): Font family (default `'xkcd'`).
    - `strokeColor` (str): Axis/border color (default `'black'`).
    - `unxkcdify` (bool): Disable hand-drawn style (default False).
    - `yTickCount` (int): Number of y-axis ticks (default 3).

    Example:

    ```
    Bar(
        title="Monthly Sales",
        x_label="Month",
        y_label="Revenue",
        labels=["Jan", "Feb", "Mar"],
        datasets=[{"data": [10, 20, 30]}],
    )
    ```
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
        _check_labels_datasets(labels, datasets, "Bar")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )
