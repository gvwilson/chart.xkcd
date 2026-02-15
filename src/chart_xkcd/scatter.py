"""Scatter plot."""

from typing import Any
from .charts import _AxisChart


class Scatter(_AxisChart):
    """Scatter plot with numeric or temporal x-axis.

    Unlike other axis charts, Scatter does not use a `labels` array.  Each
    dataset contains `{x, y}` points directly.

    Args:
        title: Chart title.
        x_label: Label for the x-axis.
        y_label: Label for the y-axis.
        datasets: List of dataset dicts, each with `data` (list of
            `{"x": number, "y": number}` dicts), `label` (str), and
            an optional `color` (str) key.
        options: Dict of chart options.

    Options:

    - `backgroundColor` (str): Background color (default `'white'`).
    - `dataColors` (list[str]): Point/line colors.
    - `dotSize` (float): Point size multiplier (default 1).
    - `fontFamily` (str): Font family (default `'xkcd'`).
    - `legendPosition` (int): Legend placement (use `positionType`).
    - `showLegend` (bool): Show legend (default True).
    - `showLine` (bool): Connect dots with lines (default False).
    - `strokeColor` (str): Axis/border color (default `'black'`).
    - `timeFormat` (str): dayjs format string for temporal x-axis.
    - `unxkcdify` (bool): Disable hand-drawn style (default False).
    - `xTickCount` (int): Number of x-axis ticks (default 3).
    - `yTickCount` (int): Number of y-axis ticks (default 3).

    Example:

    ```
    Scatter(
        title="Scatter",
        x_label="X",
        y_label="Y",
        datasets=[{
            "label": "Series A",
            "data": [{"x": 1, "y": 2}, {"x": 3, "y": 5}, {"x": 7, "y": 11}],
        }],
        options={"showLine": True, "dotSize": 2},
    )
    ```
    """

    def __init__(
        self,
        *,
        title: str | None = None,
        x_label: str | None = None,
        y_label: str | None = None,
        datasets: Any,
        options: Any = None,
    ):
        if not isinstance(datasets, (list, tuple)) or len(datasets) == 0:
            raise ValueError("Scatter: datasets must be a non-empty list")
        for i, ds in enumerate(datasets):
            if not isinstance(ds, dict) or "data" not in ds:
                raise ValueError(f"Scatter: datasets[{i}] must be a dict with a 'data' key")
            for j, pt in enumerate(ds["data"]):
                if not isinstance(pt, dict) or "x" not in pt or "y" not in pt:
                    raise ValueError(
                        f"Scatter: datasets[{i}].data[{j}] must be a dict "
                        f"with 'x' and 'y' keys"
                    )
        data = {"datasets": list(datasets)}
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )
