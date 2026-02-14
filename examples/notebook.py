import marimo

__generated_with = "0.13.0"
app = marimo.App()


@app.cell
def _():
    import marimo as mo
    from chart_xkcd import Bar, to_html

    return Bar, mo, to_html


@app.cell
def _(Bar, mo, to_html):
    chart = Bar(
        title="Github Stars vs Patron Count",
        x_label="Project",
        y_label="Count",
        labels=["chart.xkcd", "star-history", "tomato-pie"],
        datasets=[{"data": [2100, 430, 90]}],
    )
    mo.iframe(to_html(chart))
    return


if __name__ == "__main__":
    app.run()
