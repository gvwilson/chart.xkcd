/**
 * AnyWidget entry point.
 *
 * Implements the AnyWidget render protocol so that charts can be
 * displayed inside Jupyter or Marimo notebooks via the Python
 * ChartWidget class. Reads chart type, dimensions, and config
 * from the widget model's traitlets, renders the appropriate
 * chart, and wires up click/shift-click/box-select callbacks
 * that write the current selection back to the model.
 */
import Bar from './Bar';
import Line from './Line';
import Pie from './Pie';
import Radar from './Radar';
import Scatter from './Scatter';
import StackedBar from './StackedBar';
import { loadFont } from './utils/addFont';

export { Bar, Line, Pie, Radar, Scatter, StackedBar };

const chartTypes = { Bar, Line, Pie, Radar, Scatter, StackedBar };

/**
 * AnyWidget render callback.
 *
 * Called by the widget framework whenever the widget needs to be
 * (re-)rendered. Loads the xkcd font, creates a sized container
 * and SVG element, attaches a selection handler, and instantiates
 * the requested chart class.
 *
 * @param {Object} params
 * @param {Object} params.model - AnyWidget model providing get/set/save_changes.
 * @param {HTMLElement} params.el - DOM element to render into.
 */
async function render({ model, el }) {
  el.innerHTML = "";
  await loadFont();

  var width = model.get("width");
  var height = model.get("height");

  var container = document.createElement("div");
  container.style.width = width + "px";
  container.style.height = height + "px";
  el.appendChild(container);

  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "chart");
  container.appendChild(svg);

  var chartType = model.get("chart_type");
  var config = JSON.parse(model.get("config"));
  // Wire up the selection callback.
  // Plain click replaces the selection; shift-click toggles individual
  // items in or out of the current selection array. Box-select on
  // scatter plots passes an array of matching points as the payload.
  config.options = config.options || {};
  config.options.onSelect = (payload, shiftKey) => {
    var items = Array.isArray(payload) ? payload : [payload];
    if (!shiftKey) {
      model.set("selection", JSON.stringify(items));
    } else {
      var current = JSON.parse(model.get("selection") || "[]");
      items.forEach((item) => {
        var key = JSON.stringify(item);
        var idx = current.findIndex((existing) => JSON.stringify(existing) === key);
        if (idx >= 0) {
          current.splice(idx, 1);
        } else {
          current.push(item);
        }
      });
      model.set("selection", JSON.stringify(current));
    }
    model.save_changes();
  };
  new chartTypes[chartType](svg, config);
}

export default { render };
