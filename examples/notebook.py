import marimo

__generated_with = "0.13.0"
app = marimo.App()


@app.cell
def _():
    from chart_xkcd import Bar, to_widget

    return Bar, to_widget


@app.cell
def _(Bar, to_widget):
    chart = Bar(
        title="Github Stars vs Patron Count",
        x_label="Project",
        y_label="Count",
        labels=["chart.xkcd", "star-history", "tomato-pie"],
        datasets=[{"data": [2100, 430, 90]}],
    )
    to_widget(chart)
    return


if __name__ == "__main__":
    app.run()
