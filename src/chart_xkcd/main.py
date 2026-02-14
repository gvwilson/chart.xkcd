"""Command-line driver."""

import argparse
import shutil
from importlib.resources import as_file, files
from pathlib import Path


def main():
    """Entry point for command-line driver."""
    args = _parse_args()
    source = files("chart_xkcd") / "static" / "chart.xkcd.min.js"
    with as_file(source) as src_path:
        shutil.copy2(src_path, Path(args.out))


def _parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Extract the bundled chart.xkcd JavaScript file."
    )
    parser.add_argument("--out", required=True, help="output path for the .js file")
    return parser.parse_args()


if __name__ == "__main__":
    main()
