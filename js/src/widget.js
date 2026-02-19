import Bar from './Bar';
import Line from './Line';
import Pie from './Pie';
import Radar from './Radar';
import Scatter from './Scatter';
import StackedBar from './StackedBar';
import { loadFont } from './utils/addFont';

export { Bar, Line, Pie, Radar, Scatter, StackedBar };

const chartTypes = { Bar, Line, Pie, Radar, Scatter, StackedBar };

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
