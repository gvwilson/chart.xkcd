> drafting

# Contributing

Before contributing to chart.xkcd you'll need to:

- install npm
- install uv
- create a Python virtual environment

## Setup

```bash
# install dependencies
npm i
```

```bash
# start examples (example/npm)
npm start
```

Then you can open `localhost:1234` to see the examples, and you can start to edit the code. Thanks to [parcel](), the website will be auto updated when you make changes.

## Layout

- [docs](./docs): Documentation used to generate timqian.com/chart.xkcd
- [examples](./examples): Examples showing how to use chart.xkcd. The npm example is also used for developing and debug features for now.
- [js](./js): JavaScript source
- [py](./py): Python source
