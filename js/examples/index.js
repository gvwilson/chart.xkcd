import chartXkcd from '../src';
import { loadFont } from '../src/utils/addFont';

function parseCSV(text) {
  const lines = text.trim().replace(/\r/g, '').split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    headers.forEach((h, i) => row[h] = values[i]);
    return row;
  });
}

async function fetchCSV(path) {
  const resp = await fetch(path);
  return parseCSV(await resp.text());
}

async function main() {
  await loadFont();

  // Bar
  const barRows = await fetchCSV('./tmp/bar.csv');
  new chartXkcd.Bar(document.querySelector('.bar-chart'), {
    title: 'Samples per Person',
    xLabel: 'Person',
    yLabel: 'Count',
    data: {
      labels: barRows.map(r => r.name),
      datasets: [{ data: barRows.map(r => parseInt(r.num)) }],
    },
  });

  // Stacked Bar
  const stackedRows = await fetchCSV('./tmp/stacked_bar.csv');
  const grids = [...new Set(stackedRows.map(r => r.grid))].sort();
  const stackedVarieties = [...new Set(stackedRows.map(r => r.variety))].sort();
  const stackedLookup = {};
  stackedRows.forEach(r => stackedLookup[r.variety + ',' + r.grid] = parseInt(r.num));
  new chartXkcd.StackedBar(document.querySelector('.stacked-bar-chart'), {
    title: 'Samples by Variety and Grid',
    xLabel: 'Grid',
    yLabel: 'Count',
    data: {
      labels: grids,
      datasets: stackedVarieties.map(v => ({
        label: v,
        data: grids.map(g => stackedLookup[v + ',' + g]),
      })),
    },
    options: { showLegend: true },
  });

  // Line
  const lineRows = await fetchCSV('./tmp/line.csv');
  new chartXkcd.Line(document.querySelector('.line-chart'), {
    title: 'Samples Collected per Week',
    xLabel: 'Week',
    yLabel: 'Count',
    data: {
      labels: lineRows.map(r => r.week),
      datasets: [{ label: 'Samples', data: lineRows.map(r => parseInt(r.num)) }],
    },
  });

  // Scatter
  const scatterRows = await fetchCSV('./tmp/scatter.csv');
  const scatterVarieties = [...new Set(scatterRows.map(r => r.variety))].sort();
  new chartXkcd.Scatter(document.querySelector('.scatter-chart'), {
    title: 'Snail Mass vs Diameter',
    xLabel: 'Mass (g)',
    yLabel: 'Diameter (mm)',
    data: {
      datasets: scatterVarieties.map(v => ({
        label: v,
        data: scatterRows
          .filter(r => r.variety === v)
          .map(r => ({ x: parseFloat(r.mass), y: parseFloat(r.diameter) })),
      })),
    },
    options: {
      showLine: false,
      legendPosition: chartXkcd.config.positionType.upLeft,
    },
  });

  // Pie
  const pieRows = await fetchCSV('./tmp/pie.csv');
  new chartXkcd.Pie(document.querySelector('.pie-chart'), {
    title: 'Samples by Variety',
    data: {
      labels: pieRows.map(r => r.variety),
      datasets: [{ data: pieRows.map(r => parseInt(r.num)) }],
    },
    options: {
      innerRadius: 0.5,
      legendPosition: chartXkcd.config.positionType.upRight,
    },
  });

  // Radar
  const radarRows = await fetchCSV('./tmp/radar.csv');
  const radarGrids = [...new Set(radarRows.map(r => r.grid))].sort();
  const radarVarieties = [...new Set(radarRows.map(r => r.variety))].sort();
  const radarLookup = {};
  radarRows.forEach(r => radarLookup[r.variety + ',' + r.grid] = parseInt(r.num));
  new chartXkcd.Radar(document.querySelector('.radar-chart'), {
    title: 'Samples by Variety and Grid',
    data: {
      labels: radarGrids,
      datasets: radarVarieties.map(v => ({
        label: v,
        data: radarGrids.map(g => radarLookup[v + ',' + g]),
      })),
    },
    options: {
      showLabels: true,
      showLegend: true,
      dotSize: 0.8,
      legendPosition: chartXkcd.config.positionType.upRight,
    },
  });
}

main();
