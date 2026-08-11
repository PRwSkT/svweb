import os
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("เตรียมปฐมวัย", "เตรียมอนุบาล")
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Find all yml files in content
for root, dirs, files in os.walk('content'):
    for file in files:
        if file.endswith('.yml'):
            process_file(os.path.join(root, file))

# Update build script
process_file('tools/build-site.mjs')

print("Done")
