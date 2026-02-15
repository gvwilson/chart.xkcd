import marimo

__generated_with = "0.13.0"
app = marimo.App()


@app.cell
def _():
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

    return Bar, Line, Pie, Radar, Scatter, StackedBar, positionType, to_widget


@app.cell
def _(Bar, to_widget):
    to_widget(
        Bar(
            title="Github Stars vs Patron Count",
            x_label="Project",
            y_label="Count",
            labels=["chart.xkcd", "star-history", "tomato-pie"],
            datasets=[{"data": [2100, 430, 90]}],
        )
    )
    return


@app.cell
def _(StackedBar, to_widget):
    to_widget(
        StackedBar(
            title="Issues and PRs",
            x_label="Month",
            y_label="Count",
            labels=["Jan", "Feb", "Mar", "Apr", "May"],
            datasets=[
                {"label": "Issues", "data": [12, 19, 11, 29, 17]},
                {"label": "PRs", "data": [3, 5, 2, 4, 1]},
                {"label": "Merges", "data": [2, 3, 0, 1, 1]},
            ],
            options={"showLegend": True},
        )
    )
    return


@app.cell
def _(Line, to_widget):
    to_widget(
        Line(
            title="Monthly Income of an Indie Developer",
            x_label="Month",
            y_label="$ Dollars",
            labels=["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            datasets=[
                {
                    "label": "Plan",
                    "data": [30, 70, 200, 300, 500, 800, 1500, 2900, 5000, 8000],
                },
                {
                    "label": "Reality",
                    "data": [0, 1, 30, 70, 80, 100, 50, 80, 40, 150],
                },
            ],
        )
    )
    return


@app.cell
def _(Scatter, positionType, to_widget):
    to_widget(
        Scatter(
            title="Pokemon Comparison",
            x_label="Attack",
            y_label="Defense",
            datasets=[
                {
                    "label": "February",
                    "data": [
                        {"x": 50, "y": 60},
                        {"x": 70, "y": 80},
                        {"x": 90, "y": 50},
                        {"x": 40, "y": 70},
                    ],
                },
                {
                    "label": "March",
                    "data": [
                        {"x": 60, "y": 55},
                        {"x": 80, "y": 90},
                        {"x": 30, "y": 40},
                        {"x": 100, "y": 65},
                    ],
                },
            ],
            options={
                "xTickCount": 5,
                "yTickCount": 5,
                "showLine": False,
                "legendPosition": positionType.upRight,
            },
        )
    )
    return


@app.cell
def _(Pie, positionType, to_widget):
    to_widget(
        Pie(
            title="What Tim Is Made Of",
            labels=["Code", "Coffee", "Sleep", "Snacks"],
            datasets=[{"data": [500, 200, 80, 90]}],
            options={
                "innerRadius": 0.5,
                "legendPosition": positionType.upRight,
            },
        )
    )
    return


@app.cell
def _(Radar, positionType, to_widget):
    to_widget(
        Radar(
            title="Developer Skills",
            labels=["JavaScript", "Python", "Go", "Rust", "SQL"],
            datasets=[
                {"label": "Developer A", "data": [8, 9, 5, 3, 7]},
                {"label": "Developer B", "data": [6, 7, 8, 6, 5]},
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
