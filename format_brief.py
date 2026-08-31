import json
from pathlib import Path
from datetime import datetime

# ============================
# PATH CONFIGURATION
# ============================
PROJECT_ROOT = Path(__file__).resolve().parent
TOP_NEWS_FILE = PROJECT_ROOT / "data" / "top_news.json"
ENRICHED_FILE = PROJECT_ROOT / "data" / "enriched_summaries.json"
SENT_URLS_FILE = PROJECT_ROOT / "data" / "sent_urls.json"

SITE_DATA_DIR = PROJECT_ROOT / "docs" / "data"
SITE_JSON_OUTPUT = SITE_DATA_DIR / "daily_brief.json"
ARCHIVE_DIR = SITE_DATA_DIR / "archive"

# Additional Section Paths
JARGON_FILE = SITE_DATA_DIR / "jargon_buster.json"
TOOLBOX_FILE = SITE_DATA_DIR / "toolbox.json"
LAB_REPORT_FILE = SITE_DATA_DIR / "lab_report.json"

# ============================
# HELPERS
# ============================
def safe(value, fallback):
    """Guarantee non-null, non-empty output"""
    if value is None or (isinstance(value, str) and value.strip() == ""):
        return fallback
    return value

def load_section_data(file_path):
    """Safely load JSON data for optional sections"""
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None

# ============================
# MAIN LOGIC
# ============================
def main():
    SITE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    if not TOP_NEWS_FILE.exists():
        print(" ERROR: Missing top_news.json")
        return

    with open(TOP_NEWS_FILE, "r", encoding="utf-8") as f:
        top_news = json.load(f)

    enriched_map = {}
    if ENRICHED_FILE.exists():
        with open(ENRICHED_FILE, "r", encoding="utf-8") as f:
            try:
                enriched_data = json.load(f)
                enriched_map = {a.get("title", "").strip(): a for a in enriched_data}
            except Exception:
                enriched_map = {}

    final_articles = []
    newly_sent_urls = []

    for i, story in enumerate(top_news, start=1):
        original_title = story.get("title", "").strip()
        enriched_story = enriched_map.get(original_title)
        is_backup = enriched_story is None
        
        # Summary Recovery Logic: Prioritize AI-enriched text
        summary_text = safe(
            enriched_story.get("what_happened") if enriched_story else None,
            story.get("summary", "No summary available.")
        )

        final_article = {
            "rank": i,
            "title": f"[Archive] {original_title}" if is_backup else original_title,
            "summary": summary_text,
            "technical_takeaway": safe(
                enriched_story.get("technical_angle") if enriched_story else None,
                "Key technical reference from archive."
            ),
            "primary_risk": safe(
                enriched_story.get("primary_risk") if enriched_story else None,
                "Standard implementation risks apply."
            ),
            "primary_opportunity": safe(
                enriched_story.get("primary_opportunity") if enriched_story else None,
                "Incremental framework gains."
            ),
            "source": story.get("source", "Unknown"),
            "url": story.get("url", "#")
        }
        final_articles.append(final_article)
        newly_sent_urls.append(story.get("url", "#"))

    # ----------------------------
    # MEMORY UPDATE
    # ----------------------------
    existing_sent = []
    if SENT_URLS_FILE.exists():
        with open(SENT_URLS_FILE, "r", encoding="utf-8") as f:
            try: 
                data = json.load(f)
                if isinstance(data, list):
                    existing_sent = data
                else:
                    existing_sent = []
            except Exception: 
                existing_sent = []
    
    updated_sent = list(set(existing_sent + newly_sent_urls))[-200:]
    with open(SENT_URLS_FILE, "w", encoding="utf-8") as f:
        json.dump(updated_sent, f, indent=2)

    # ----------------------------
    # FETCH OTHER SECTIONS FOR ARCHIVE
    # ----------------------------
    jargon_data = load_section_data(JARGON_FILE)
    toolbox_data = load_section_data(TOOLBOX_FILE)
    lab_report_data = load_section_data(LAB_REPORT_FILE)

    # ----------------------------
    # CREATE FINAL JSON PAYLOAD
    # ----------------------------
    date_str = datetime.now().strftime("%B %d, %Y")
    date_key = datetime.now().strftime("%Y-%m-%d")

    site_payload = {
        "date": date_str,
        "timestamp": datetime.now().isoformat(),
        "is_archive_run": any("[Archive]" in a["title"] for a in final_articles),
        "total_stories": len(final_articles),
        "top_stories": final_articles,
        "jargon": jargon_data,
        "toolbox": toolbox_data,
        "lab_report": lab_report_data
    }

    # Save to daily_brief.json
    with open(SITE_JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(site_payload, f, indent=2, ensure_ascii=False)
    
    # Save copy to archive directory
    archive_file_path = ARCHIVE_DIR / f"brief_{date_key}.json"
    with open(archive_file_path, "w", encoding="utf-8") as f:
        json.dump(site_payload, f, indent=2, ensure_ascii=False)

    print(f" Success: Daily brief JSON created at {SITE_JSON_OUTPUT}")
    print(f" Success: Archived brief created at {archive_file_path}")

if __name__ == "__main__":
    main()