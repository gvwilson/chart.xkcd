# Contributing

Contributions are very welcome.
Please file issues or submit pull requests in our [GitHub repository][repo].
All contributors will be acknowledged,
but must abide by our Code of Conduct.

## Setup

-   `uv venv` (once)
-   `source .venv/bin/activate`
-   `uv sync --extra dev`
-   `cd js`
-   `npm install`

## Operations

`task --list` displays a list of actions:

| action  | effect |
| ------- | |
| build   | build package |
| lint    | check code issues |
| clean   | clean up |
| docs    | build documentation |
| ex_js   | run server to view JS examples
| ex_py   | re-create HTML files using Python
| fix     | fix Python code issues |
| format  | format Python code |
| publish | publish using ~/.pypirc credentials |
| serve   | run local server for previewing examples |

You may also use `marimo run examples/notebook.py`
to view a [Marimo notebook][marimo] of examples.

[marimo]: https://marimo.io/
[repo]: https://github.com/gvwilson/chart.xkcd
