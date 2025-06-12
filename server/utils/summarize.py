import sys
import json
from transformers import pipeline

def main():
    input_json = sys.stdin.read()
    data = json.loads(input_json)
    transcript = data.get("text", "")

    if not transcript:
        print(json.dumps({"error": "No transcript provided"}))
        return

    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    summary = summarizer(transcript, max_length=130, min_length=30, do_sample=False)[0]["summary_text"]

    print(json.dumps({"summary": summary}))

if __name__ == "__main__":
    main()
