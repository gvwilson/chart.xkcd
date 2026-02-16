import marimo

__generated_with = "0.13.0"
app = marimo.App()


@app.cell
def _():
    import csv

    from chart_xkcd import (
        Bar,
        Line,
        Pie,
        Radar,
        Scatter,
        StackedBar,
        positionType,
        to_widget,
    )

    return Bar, Line, Pie, Radar, Scatter, StackedBar, csv, positionType, to_widget


@app.cell
def _(Bar, csv, to_widget):
    with open("tmp/bar.csv") as _f:
        _rows = list(csv.DictReader(_f))

    to_widget(
        Bar(
            title="Samples per Person",
            x_label="Person",
            y_label="Count",
            labels=[r["name"] for r in _rows],
            datasets=[{"data": [int(r["num"]) for r in _rows]}],
        )
    )
    return


@app.cell
def _(StackedBar, csv, to_widget):
    with open("tmp/stacked_bar.csv") as _f:
        _rows = list(csv.DictReader(_f))

    _grids = sorted(set(r["grid"] for r in _rows))
    _varieties = sorted(set(r["variety"] for r in _rows))
    _lookup = {(r["variety"], r["grid"]): int(r["num"]) for r in _rows}

    to_widget(
        StackedBar(
            title="Samples by Variety and Grid",
            x_label="Grid",
            y_label="Count",
            labels=_grids,
            datasets=[
                {"label": v, "data": [_lookup[(v, g)] for g in _grids]}
                for v in _varieties
            ],
            options={"showLegend": True},
        )
    )
    return


@app.cell
def _(Line, csv, to_widget):
    with open("tmp/line.csv") as _f:
        _rows = list(csv.DictReader(_f))

    to_widget(
        Line(
            title="Samples Collected per Week",
            x_label="Week",
            y_label="Count",
            labels=[r["week"] for r in _rows],
            datasets=[{"label": "Samples", "data": [int(r["num"]) for r in _rows]}],
        )
    )
    return


@app.cell
def _(Scatter, csv, positionType, to_widget):
    with open("tmp/scatter.csv") as _f:
        _rows = list(csv.DictReader(_f))

    _varieties = sorted(set(r["variety"] for r in _rows))

    to_widget(
        Scatter(
            title="Snail Mass vs Diameter",
            x_label="Mass (g)",
            y_label="Diameter (mm)",
            datasets=[
                {
                    "label": v,
                    "data": [
                        {"x": float(r["mass"]), "y": float(r["diameter"])}
                        for r in _rows
                        if r["variety"] == v
                    ],
                }
                for v in _varieties
            ],
            options={
                "showLine": False,
                "legendPosition": positionType.upLeft,
            },
        )
    )
    return


@app.cell
def _(Pie, csv, positionType, to_widget):
    with open("tmp/pie.csv") as _f:
        _rows = list(csv.DictReader(_f))

    to_widget(
        Pie(
            title="Samples by Variety",
            labels=[r["variety"] for r in _rows],
            datasets=[{"data": [int(r["num"]) for r in _rows]}],
            options={
                "innerRadius": 0.5,
                "legendPosition": positionType.upRight,
            },
        )
    )
    return


@app.cell
def _(Radar, csv, positionType, to_widget):
    with open("tmp/radar.csv") as _f:
        _rows = list(csv.DictReader(_f))

    _grids = sorted(set(r["grid"] for r in _rows))
    _varieties = sorted(set(r["variety"] for r in _rows))
    _lookup = {(r["variety"], r["grid"]): int(r["num"]) for r in _rows}

    to_widget(
        Radar(
            title="Samples by Variety and Grid",
            labels=_grids,
            datasets=[
                {"label": v, "data": [_lookup[(v, g)] for g in _grids]}
                for v in _varieties
            ],
            options={
                "showLabels": True,
                "showLegend": True,
                "dotSize": 0.8,
                "legendPosition": positionType.upRight,
            },
        )
    )
    return


if __name__ == "__main__":
    app.run()
