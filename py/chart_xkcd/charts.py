"""Chart classes mirroring the chart.xkcd JS API."""


class _BaseChart:
    """Base class for all chart types."""

    def __init__(self, *, title=None, data, options=None):
        self.title = title
        self.data = data
        self.options = options

    def to_dict(self):
        config = {}
        if self.title is not None:
            config["title"] = self.title
        config["data"] = self.data
        if self.options:
            config["options"] = self.options
        return config


class _AxisChart(_BaseChart):
    """Base class for charts with x/y axis labels."""

    def __init__(self, *, title=None, x_label=None, y_label=None, data, options=None):
        super().__init__(title=title, data=data, options=options)
        self.x_label = x_label
        self.y_label = y_label

    def to_dict(self):
        config = super().to_dict()
        if self.x_label is not None:
            config["xLabel"] = self.x_label
        if self.y_label is not None:
            config["yLabel"] = self.y_label
        return config


def _check_labels_datasets(labels, datasets, chart_name):
    """Validate that labels and datasets are well-formed."""
    if not isinstance(labels, (list, tuple)):
        raise TypeError(f"{chart_name}: labels must be a list")
    if not isinstance(datasets, (list, tuple)) or len(datasets) == 0:
        raise ValueError(f"{chart_name}: datasets must be a non-empty list")
    for i, ds in enumerate(datasets):
        if not isinstance(ds, dict) or "data" not in ds:
            raise ValueError(
                f"{chart_name}: datasets[{i}] must be a dict with a 'data' key"
            )
        if len(ds["data"]) != len(labels):
            raise ValueError(
                f"{chart_name}: datasets[{i}] has {len(ds['data'])} values "
                f"but there are {len(labels)} labels"
            )


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
        options: Dict of chart options:
            - `yTickCount` (int): Number of y-axis ticks (default 3).
            - `dataColors` (list[str]): Bar colors.
            - `fontFamily` (str): Font family (default `'xkcd'`).
            - `strokeColor` (str): Axis/border color (default `'black'`).
            - `backgroundColor` (str): Background color (default `'white'`).
            - `unxkcdify` (bool): Disable hand-drawn style (default False).

    Example::

        Bar(
            title="Monthly Sales",
            x_label="Month",
            y_label="Revenue",
            labels=["Jan", "Feb", "Mar"],
            datasets=[{"data": [10, 20, 30]}],
        )
    """

    def __init__(
        self, *, title=None, x_label=None, y_label=None, labels, datasets, options=None
    ):
        _check_labels_datasets(labels, datasets, "Bar")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )


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
        self, *, title=None, x_label=None, y_label=None, labels, datasets, options=None
    ):
        _check_labels_datasets(labels, datasets, "StackedBar")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )


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
        self, *, title=None, x_label=None, y_label=None, labels, datasets, options=None
    ):
        _check_labels_datasets(labels, datasets, "Line")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )


class XY(_AxisChart):
    """XY scatter/line chart with numeric or temporal x-axis.

    Unlike other axis charts, XY does not use a `labels` array.  Each
    dataset contains `{x, y}` points directly.

    Args:
        title: Chart title.
        x_label: Label for the x-axis.
        y_label: Label for the y-axis.
        datasets: List of dataset dicts, each with `data` (list of
            `{"x": number, "y": number}` dicts), `label` (str), and
            an optional `color` (str) key.
        options: Dict of chart options:
            - `dotSize` (float): Point size multiplier (default 1).
            - `showLine` (bool): Connect dots with lines (default False).
            - `timeFormat` (str): dayjs format string for temporal x-axis.
            - `xTickCount` (int): Number of x-axis ticks (default 3).
            - `yTickCount` (int): Number of y-axis ticks (default 3).
            - `legendPosition` (int): Legend placement (use `positionType`).
            - `showLegend` (bool): Show legend (default True).
            - `dataColors` (list[str]): Point/line colors.
            - `fontFamily` (str): Font family (default `'xkcd'`).
            - `strokeColor` (str): Axis/border color (default `'black'`).
            - `backgroundColor` (str): Background color (default `'white'`).
            - `unxkcdify` (bool): Disable hand-drawn style (default False).

    Example::

        XY(
            title="Scatter",
            x_label="X",
            y_label="Y",
            datasets=[{
                "label": "Series A",
                "data": [{"x": 1, "y": 2}, {"x": 3, "y": 5}, {"x": 7, "y": 11}],
            }],
            options={"showLine": True, "dotSize": 2},
        )
    """

    def __init__(
        self, *, title=None, x_label=None, y_label=None, datasets, options=None
    ):
        if not isinstance(datasets, (list, tuple)) or len(datasets) == 0:
            raise ValueError("XY: datasets must be a non-empty list")
        for i, ds in enumerate(datasets):
            if not isinstance(ds, dict) or "data" not in ds:
                raise ValueError(
                    f"XY: datasets[{i}] must be a dict with a 'data' key"
                )
            for j, pt in enumerate(ds["data"]):
                if not isinstance(pt, dict) or "x" not in pt or "y" not in pt:
                    raise ValueError(
                        f"XY: datasets[{i}].data[{j}] must be a dict "
                        f"with 'x' and 'y' keys"
                    )
        data = {"datasets": list(datasets)}
        super().__init__(
            title=title, x_label=x_label, y_label=y_label, data=data, options=options
        )


class Pie(_BaseChart):
    """Pie/donut chart.

    Uses a single dataset. Only `datasets[0]` is rendered.

    Args:
        title: Chart title.
        labels: Slice labels.
        datasets: List containing one dataset dict with a `data` key
            (list of numeric values).
        options: Dict of chart options:
            - `innerRadius` (float): 0 for pie, 0.5 for donut (default 0.5).
            - `legendPosition` (int): Legend placement (use `positionType`).
            - `showLegend` (bool): Show legend (default True).
            - `dataColors` (list[str]): Slice colors.
            - `fontFamily` (str): Font family (default `'xkcd'`).
            - `strokeColor` (str): Border color (default `'black'`).
            - `backgroundColor` (str): Background color (default `'white'`).
            - `unxkcdify` (bool): Disable hand-drawn style (default False).

    Example::

        Pie(
            title="Browser Share",
            labels=["Chrome", "Firefox", "Safari"],
            datasets=[{"data": [60, 20, 20]}],
            options={"innerRadius": 0.5},
        )
    """

    def __init__(self, *, title=None, labels, datasets, options=None):
        _check_labels_datasets(labels, datasets, "Pie")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(title=title, data=data, options=options)


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

    def __init__(self, *, title=None, labels, datasets, options=None):
        _check_labels_datasets(labels, datasets, "Radar")
        data = {"labels": list(labels), "datasets": list(datasets)}
        super().__init__(title=title, data=data, options=options)
