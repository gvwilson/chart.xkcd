import marimo

__generated_with = "0.13.0"
app = marimo.App()


@app.cell
def _():
    import csv

    import marimo as mo

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

    return Bar, Line, Pie, Radar, Scatter, StackedBar, csv, mo, positionType, to_widget


@app.cell
def _(
    bar_chart,
    line_chart,
    mo,
    pie_chart,
    radar_chart,
    scatter_chart,
    stacked_bar_chart,
    to_widget,
):
    _small = {"width": 300, "height": 200, "extra_options": {"legendScale": 50}}
    mo.vstack([
        mo.hstack([
            to_widget(bar_chart, **_small),
            to_widget(stacked_bar_chart, **_small),
            to_widget(line_chart, **_small),
        ]),
        mo.hstack([
            to_widget(scatter_chart, **_small),
            to_widget(pie_chart, **_small),
            to_widget(radar_chart, **_small),
        ]),
    ])
    return


@app.cell
def _(Bar, csv):
    with open("tmp/bar.csv") as _f:
        _rows = list(csv.DictReader(_f))

    bar_chart = Bar(
        title="Samples per Person",
        x_label="Person",
        y_label="Count",
        labels=[r["name"] for r in _rows],
        datasets=[{"data": [int(r["num"]) for r in _rows]}],
    )
    return (bar_chart,)


@app.cell
def _(bar_chart, to_widget):
    to_widget(bar_chart)
    return


@app.cell
def _(StackedBar, csv):
    with open("tmp/stacked_bar.csv") as _f:
        _rows = list(csv.DictReader(_f))

    _grids = sorted(set(r["grid"] for r in _rows))
    _varieties = sorted(set(r["variety"] for r in _rows))
    _lookup = {(r["variety"], r["grid"]): int(r["num"]) for r in _rows}

    stacked_bar_chart = StackedBar(
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
    return (stacked_bar_chart,)


@app.cell
def _(stacked_bar_chart, to_widget):
    to_widget(stacked_bar_chart)
    return


@app.cell
def _(Line, csv):
    with open("tmp/line.csv") as _f:
        _rows = list(csv.DictReader(_f))

    line_chart = Line(
        title="Samples Collected per Week",
        x_label="Week",
        y_label="Count",
        labels=[r["week"] for r in _rows],
        datasets=[{"label": "Samples", "data": [int(r["num"]) for r in _rows]}],
    )
    return (line_chart,)


@app.cell
def _(line_chart, to_widget):
    to_widget(line_chart)
    return


@app.cell
def _(Scatter, csv, positionType):
    with open("tmp/scatter.csv") as _f:
        _rows = list(csv.DictReader(_f))

    _varieties = sorted(set(r["variety"] for r in _rows))

    scatter_chart = Scatter(
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
    return (scatter_chart,)


@app.cell
def _(scatter_chart, to_widget):
    to_widget(scatter_chart)
    return


@app.cell
def _(Pie, csv, positionType):
    with open("tmp/pie.csv") as _f:
        _rows = list(csv.DictReader(_f))

    pie_chart = Pie(
        title="Samples by Variety",
        labels=[r["variety"] for r in _rows],
        datasets=[{"data": [int(r["num"]) for r in _rows]}],
        options={
            "innerRadius": 0.5,
            "legendPosition": positionType.upRight,
        },
    )
    return (pie_chart,)


@app.cell
def _(pie_chart, to_widget):
    to_widget(pie_chart)
    return


@app.cell
def _(Radar, csv, positionType):
    with open("tmp/radar.csv") as _f:
        _rows = list(csv.DictReader(_f))

    _grids = sorted(set(r["grid"] for r in _rows))
    _varieties = sorted(set(r["variety"] for r in _rows))
    _lookup = {(r["variety"], r["grid"]): int(r["num"]) for r in _rows}

    radar_chart = Radar(
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
    return (radar_chart,)


@app.cell
def _(radar_chart, to_widget):
    to_widget(radar_chart)
    return


if __name__ == "__main__":
    app.run()
