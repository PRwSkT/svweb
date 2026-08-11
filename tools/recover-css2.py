import json
import os

transcript_path = "/Users/peerawatsmacbookpro/.gemini/antigravity/brain/b3ed2461-c034-4161-91bb-2ea434274efc/.system_generated/logs/transcript_full.jsonl"
target_file = "/Users/peerawatsmacbookpro/Documents/Somkidvittaya Website/src/css/components.css"

# 1. Restore the committed files from e218bed
os.system("git checkout e218bed -- src/css/")

def apply_replace(file_content, target, replacement, allow_multiple=False):
    if allow_multiple:
        return file_content.replace(target, replacement)
    else:
        return file_content.replace(target, replacement, 1)

with open(target_file, "r") as f:
    current_content = f.read()

print("Base content length:", len(current_content))

applied_count = 0
with open(transcript_path, "r") as f:
    for line in f:
        try:
            step = json.loads(line)
        except:
            continue
        
        # Only process edits after the e218bed commit time (approx 2026-08-10T17:06:36Z, but let's just use 2026-08-11T00:06:36Z string comparison)
        # Actually git log --date=local is Aug 11 00:06. In UTC that is Aug 10 17:06.
        if step.get("created_at", "") < "2026-08-10T17:06:36Z":
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
                        else:
                            print(f"Failed to apply single replace at {step.get('created_at')}")
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
                            else:
                                print(f"Failed to apply chunk at {step.get('created_at')}")

with open(target_file, "w") as f:
    f.write(current_content)

print("Applied", applied_count, "edits.")
print("Final length:", len(current_content))
