import Bar from './Bar';
import StackedBar from './StackedBar';
import Pie from './Pie';
import Line from './Line';
import XY from './XY';
import Radar from './Radar';

const chartTypes = { Bar, StackedBar, Pie, Line, XY, Radar };

function render({ model, el }) {
  el.innerHTML = "";

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
  new chartTypes[chartType](svg, config);
}

export default { render };
