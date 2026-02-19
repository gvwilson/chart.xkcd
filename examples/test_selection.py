import marimo

__generated_with = "0.13.0"
app = marimo.App()


@app.cell
def _():
    import json

    import marimo as mo

    from chart_xkcd import Bar, Pie, Scatter, positionType, to_widget

    return Bar, Pie, Scatter, json, mo, positionType, to_widget


@app.cell
def _(Bar, mo, to_widget):
    bar_widget = mo.ui.anywidget(
        to_widget(
            Bar(
                title="Click a Bar (shift-click to add)",
                x_label="Person",
                y_label="Count",
                labels=["Alice", "Bob", "Carol"],
                datasets=[{"data": [10, 20, 15]}],
            )
        )
    )
    bar_widget
    return (bar_widget,)


@app.cell
def _(bar_widget, json, mo):
    _sel = json.loads(bar_widget.selection)
    mo.stop(not _sel, mo.md("*Click a bar above to see selection data.*"))
    _lines = [
        f"- index={s['index']}, label={s['label']}, value={s['value']}"
        for s in _sel
    ]
    mo.md(f"**Bar selection ({len(_sel)}):**\n\n" + "\n".join(_lines))
    return


@app.cell
def _(Pie, mo, positionType, to_widget):
    pie_widget = mo.ui.anywidget(
        to_widget(
            Pie(
                title="Click a Slice (shift-click to add)",
                labels=["plain", "spotted", "banded"],
                datasets=[{"data": [24, 23, 17]}],
                options={
                    "innerRadius": 0.5,
                    "legendPosition": positionType.upRight,
                },
            )
        )
    )
    pie_widget
    return (pie_widget,)


@app.cell
def _(json, mo, pie_widget):
    _sel = json.loads(pie_widget.selection)
    mo.stop(not _sel, mo.md("*Click a pie slice above to see selection data.*"))
    _lines = [
        f"- index={s['index']}, label={s['label']}, value={s['value']}"
        for s in _sel
    ]
    mo.md(f"**Pie selection ({len(_sel)}):**\n\n" + "\n".join(_lines))
    return


@app.cell
def _(Scatter, mo, positionType, to_widget):
    scatter_widget = mo.ui.anywidget(
        to_widget(
            Scatter(
                title="Click a Point (shift-click to add)",
                x_label="Mass (g)",
                y_label="Diameter (mm)",
                datasets=[
                    {
                        "label": "plain",
                        "data": [
                            {"x": 17.6, "y": 11.8},
                            {"x": 71.2, "y": 50.8},
                            {"x": 8.6, "y": 5.6},
                        ],
                    },
                    {
                        "label": "spotted",
                        "data": [
                            {"x": 15.8, "y": 11.2},
                            {"x": 25.9, "y": 18.1},
                            {"x": 14.9, "y": 9.9},
                        ],
                    },
                ],
                options={
                    "showLine": False,
                    "legendPosition": positionType.upLeft,
                },
            )
        )
    )
    scatter_widget
    return (scatter_widget,)


@app.cell
def _(json, mo, scatter_widget):
    _sel = json.loads(scatter_widget.selection)
    mo.stop(not _sel, mo.md("*Click a scatter point above to see selection data.*"))
    _lines = [
        f"- dataset={s.get('label', '')}, x={s.get('x', '')}, y={s.get('y', '')}"
        for s in _sel
    ]
    mo.md(f"**Scatter selection ({len(_sel)}):**\n\n" + "\n".join(_lines))
    return


if __name__ == "__main__":
    app.run()
