import sys

with open("tools/build-site.mjs", "r") as f:
    content = f.read()

with open("temp_header.js", "r") as f:
    header_content = f.read()

import re
# find function languageSelect(page, locale) { ... } function header(page, locale) { ... }
new_content = re.sub(r"function languageSelect.*?</header>`;\n}", header_content.strip(), content, flags=re.DOTALL)

with open("tools/build-site.mjs", "w") as f:
    f.write(new_content)
