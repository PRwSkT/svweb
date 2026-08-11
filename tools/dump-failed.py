import json

transcript_path = "/Users/peerawatsmacbookpro/.gemini/antigravity/brain/b3ed2461-c034-4161-91bb-2ea434274efc/.system_generated/logs/transcript_full.jsonl"
with open(transcript_path, "r") as f:
    for line in f:
        if "10:21:47Z" in line:
            step = json.loads(line)
            if "tool_calls" in step:
                for call in step["tool_calls"]:
                    if call["name"] == "multi_replace_file_content" or call["name"] == "replace_file_content":
                        print(json.dumps(call["args"], indent=2))
