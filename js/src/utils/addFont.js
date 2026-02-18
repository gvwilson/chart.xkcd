import fontDataUrl from './fontData';

let fontLoaded = false;

export async function loadFont() {
  if (fontLoaded) return;
  const font = new FontFace('xkcd', `url("${fontDataUrl}")`);
  const loaded = await font.load();
  document.fonts.add(loaded);
  fontLoaded = true;
}

export default function addFont(parent) {
  parent.append('defs')
    .append('style')
    .attr('type', 'text/css')
    .text(`@font-face {
      font-family: "xkcd";
      src: url("${fontDataUrl}") format("truetype");
    }`);
}
