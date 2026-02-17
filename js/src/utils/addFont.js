let fontUrl = null;

export function setFontUrl(url) {
  fontUrl = url;
}

export default function addFont(parent) {
  if (!fontUrl) return;
  parent.append('defs')
    .append('style')
    .attr('type', 'text/css')
    .text(`@font-face {
      font-family: "xkcd";
      src: url("${fontUrl}") format("truetype");
    }`);
}
