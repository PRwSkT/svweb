import re

with open('tools/build-site.mjs', 'r') as f:
    content = f.read()

with open('tools/recreate_sections.js', 'r') as f:
    recreate_code = f.read()
    
with open('tools/temp_why_sv.js', 'r') as f:
    why_sv_code = f.read()

# Replace homeSections
home_sections_replacement = """function homeSections(page, locale) {
  return `${stats(locale)}${quickLinks(locale)}${directorQuote(locale)}${homeVideoSection(locale)}${whySV(locale)}${programCards(locale)}${parentVoices(locale)}${news(locale)}${formSection(locale, "quick-inquiry")}`;
}"""

content = re.sub(r'function homeSections\(page, locale\) \{[\s\S]*?\}', home_sections_replacement, content)

# Inject new functions before outputPath
injection = why_sv_code + "\n\n" + recreate_code + "\n\n"
content = content.replace("function outputPath(path, locale) {", injection + "function outputPath(path, locale) {")

with open('tools/build-site.mjs', 'w') as f:
    f.write(content)
