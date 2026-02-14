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
