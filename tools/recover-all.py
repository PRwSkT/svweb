import json
import os

transcript_path = "/Users/peerawatsmacbookpro/.gemini/antigravity/brain/b3ed2461-c034-4161-91bb-2ea434274efc/.system_generated/logs/transcript_full.jsonl"
skip_files = [
    "/Users/peerawatsmacbookpro/Documents/Somkidvittaya Website/src/css/components.css",
    "/Users/peerawatsmacbookpro/Documents/Somkidvittaya Website/tools/build-site.mjs"
]

def apply_replace(file_content, target, replacement, allow_multiple=False):
    if allow_multiple:
        return file_content.replace(target, replacement)
    else:
        return file_content.replace(target, replacement, 1)

applied_count = 0

# First, restore all files to their state at e218bed except the ones we're skipping
os.system("git restore --source=e218bed --worktree content/ src/main.js")

# Get a fresh dict of file contents
file_contents = {}
for root, _, files in os.walk("content"):
    for f in files:
        if f.endswith(".yml"):
            path = os.path.join(root, f)
            abs_path = os.path.abspath(path)
            with open(path, "r") as fh:
                file_contents[abs_path] = fh.read()

main_js_path = os.path.abspath("src/main.js")
with open("src/main.js", "r") as fh:
    file_contents[main_js_path] = fh.read()

with open(transcript_path, "r") as f:
    for line in f:
        try:
            step = json.loads(line)
        except:
            continue
        
        if step.get("created_at", "") < "2026-08-10T17:06:36Z":
            continue

        if "tool_calls" in step:
            for call in step["tool_calls"]:
                name = call["name"]
                args = call.get("args", {})
                target_file = args.get("TargetFile")
                
                if not target_file or target_file in skip_files or not target_file.startswith("/Users/peerawatsmacbookpro/Documents/Somkidvittaya Website/"):
                    continue

                # Ensure we have the file in our dictionary if it's new
                if target_file not in file_contents:
                    file_contents[target_file] = ""

                current_content = file_contents[target_file]

                if name == "write_to_file":
                    file_contents[target_file] = args.get("CodeContent", "")
                    applied_count += 1
                elif name == "replace_file_content":
                    target = args["TargetContent"]
                    replacement = args["ReplacementContent"]
                    allow = args.get("AllowMultiple", False)
                    if target in current_content:
                        file_contents[target_file] = apply_replace(current_content, target, replacement, allow)
                        applied_count += 1
                    else:
                        print(f"Failed to apply single replace to {target_file} at {step.get('created_at')}")
                elif name == "multi_replace_file_content":
                    chunks = args.get("ReplacementChunks", [])
                    if isinstance(chunks, str):
                        chunks = json.loads(chunks)
                    for chunk in chunks:
                        target = chunk["TargetContent"]
                        replacement = chunk["ReplacementContent"]
                        allow = chunk.get("AllowMultiple", False)
                        if target in current_content:
                            file_contents[target_file] = apply_replace(file_contents[target_file], target, replacement, allow)
                            applied_count += 1
                        else:
                            print(f"Failed to apply chunk to {target_file} at {step.get('created_at')}")

for path, content in file_contents.items():
    if not os.path.exists(os.path.dirname(path)):
        os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as fh:
        fh.write(content)

print(f"Successfully applied {applied_count} edits.")
