"""base-64 encode a font for use in JavaScript."""

import base64
import sys

assert len(sys.argv) == 3, f"usage: {sys.argv[0]} input_font_file output_js_file"
data = base64.b64encode(open(sys.argv[1],"rb").read()).decode()
text = 'export default "data:font/ttf;base64,' + data + '";\n'
with open(sys.argv[2], "w") as writer:
    writer.write(text)
