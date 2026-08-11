import json
import re
import os

transcript_path = "/Users/peerawatsmacbookpro/.gemini/antigravity/brain/b3ed2461-c034-4161-91bb-2ea434274efc/.system_generated/logs/transcript_full.jsonl"
target_file = "/Users/peerawatsmacbookpro/Documents/Somkidvittaya Website/src/css/components.css"

# 1. Restore the original styles.css to generate the initial components.css
os.system("git checkout e218bed -- src/styles.css")
with open("src/styles.css", "r") as f:
    css = f.read()

root_regex = re.compile(r":root\s*\{[\s\S]*?\}")
css = root_regex.sub("", css)

# Make sure src/css exists
os.makedirs("src/css", exist_ok=True)
with open("src/css/components.css", "w") as f:
    f.write(css)

print("Initialized components.css with length:", len(css))

# 2. Parse transcript and apply edits
def apply_replace(file_content, target, replacement, allow_multiple=False):
    if allow_multiple:
        return file_content.replace(target, replacement)
    else:
        return file_content.replace(target, replacement, 1)

with open("src/css/components.css", "r") as f:
    current_content = f.read()

applied_count = 0
with open(transcript_path, "r") as f:
    for line in f:
        try:
            step = json.loads(line)
        except:
            continue
        if "tool_calls" in step:
            for call in step["tool_calls"]:
                if call["name"] == "replace_file_content":
                    args = call["args"]
                    if args.get("TargetFile") == target_file:
                        target = args["TargetContent"]
                        replacement = args["ReplacementContent"]
                        allow = args.get("AllowMultiple", False)
                        if target in current_content:
                            current_content = apply_replace(current_content, target, replacement, allow)
                            applied_count += 1
                elif call["name"] == "multi_replace_file_content":
                    args = call["args"]
                    if args.get("TargetFile") == target_file:
                        chunks = args.get("ReplacementChunks", [])
                        if isinstance(chunks, str):
                            chunks = json.loads(chunks)
                        for chunk in chunks:
                            target = chunk["TargetContent"]
                            replacement = chunk["ReplacementContent"]
                            allow = chunk.get("AllowMultiple", False)
                            if target in current_content:
                                current_content = apply_replace(current_content, target, replacement, allow)
                                applied_count += 1

with open("src/css/components.css", "w") as f:
    f.write(current_content)

print("Applied", applied_count, "edits.")
print("Final length:", len(current_content))
