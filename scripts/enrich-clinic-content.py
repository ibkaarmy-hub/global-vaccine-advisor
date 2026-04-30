"""
Enrich clinic data by crawling each clinic's website and extracting
travel medicine details using OpenRouter AI.

Usage (from the 03-site folder):
    python scripts/enrich-clinic-content.py YOUR_OPENROUTER_API_KEY

Requirements:
    pip install requests beautifulsoup4

Get an OpenRouter API key at: https://openrouter.ai
Cost estimate: ~$0.02-0.05 total for all 86 clinics

What it extracts per clinic:
  - services_summary    Short description of their travel medicine offering
  - travel_specialist   True if travel medicine is a core focus (not just one of 50 services)
  - yf_licensed         True if they mention MOH yellow fever / ICVP / yellow card
  - certifications      Any accreditations or licences mentioned
  - consult_note        Pre-travel consultation info (is it included? separate fee?)
  - highlight           One punchy line for the listing card (e.g. "MOH-licensed yellow fever centre")
"""

import json, requests, time, os, sys
from bs4 import BeautifulSoup

if len(sys.argv) < 2:
    print("Usage: python scripts/enrich-clinic-content.py YOUR_OPENROUTER_API_KEY")
    sys.exit(1)

OPENROUTER_KEY = sys.argv[1]
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SG_JSON  = os.path.join(BASE_DIR, 'data', 'clinics-sg.json')
MY_JSON  = os.path.join(BASE_DIR, 'data', 'clinics-my.json')
OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
MODEL = 'anthropic/claude-haiku-4-5'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; TravelVaccineAdvisor/1.0; +https://travelvaccineadvisor.com)',
    'Accept': 'text/html,application/xhtml+xml',
}

EXTRACT_PROMPT = """You are extracting travel medicine information from a clinic's website content.

Clinic name: {clinic_name}
Country: {country}
Website content (homepage + any services/travel pages found):
---
{content}
---

Return ONLY valid JSON with exactly these fields:
{{
  "services_summary": "2-3 sentence description of their travel medicine / vaccination services. Be specific — mention vaccine types, pre-travel consultation, certifications if present. If content is thin, write what you can infer.",
  "travel_specialist": true or false (true = travel medicine is a named speciality or major focus; false = just one of many general GP services),
  "yf_licensed": true or false (true = they specifically mention yellow fever, ICVP, yellow card, or MOH authorised vaccination centre),
  "certifications": ["list", "of", "any", "accreditations", "or", "licences", "mentioned"],
  "consult_note": "Info about pre-travel consultation — e.g. 'Included in vaccination fee' or 'Separate consultation required' or null if not mentioned",
  "highlight": "One short punchy phrase for the listing card, e.g. 'MOH-licensed yellow fever centre' or 'Walk-in travel vaccinations daily' or 'Specialist travel medicine clinic'. Max 8 words."
}}

Return only the JSON object. No markdown, no explanation."""


def fetch_page_text(url, timeout=10):
    """Fetch a URL and return clean text content."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout)
        if r.status_code != 200:
            return ''
        soup = BeautifulSoup(r.text, 'html.parser')
        # Remove nav, footer, scripts, styles
        for tag in soup(['nav', 'footer', 'script', 'style', 'header', 'aside']):
            tag.decompose()
        text = soup.get_text(separator=' ', strip=True)
        # Collapse whitespace
        return ' '.join(text.split())[:6000]  # cap at 6000 chars
    except Exception:
        return ''


def find_travel_pages(base_url, homepage_html):
    """Look for travel medicine / vaccination sub-pages to crawl."""
    try:
        soup = BeautifulSoup(homepage_html, 'html.parser')
        keywords = ['travel', 'vaccin', 'immunis', 'immuniz', 'yellow', 'services', 'about']
        found = []
        for a in soup.find_all('a', href=True):
            href = a['href'].lower()
            text = a.get_text().lower()
            if any(k in href or k in text for k in keywords):
                full = href if href.startswith('http') else base_url.rstrip('/') + '/' + href.lstrip('/')
                if full not in found and full != base_url:
                    found.append(full)
        return found[:3]  # max 3 sub-pages
    except Exception:
        return []


def enrich_clinic(clinic):
    url = clinic.get('website_url')
    if not url:
        return None

    print(f"  → {clinic['clinic_name']}...", end=' ', flush=True)

    # Fetch homepage
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        homepage_html = r.text if r.status_code == 200 else ''
    except Exception:
        print("unreachable")
        return None

    homepage_text = fetch_page_text(url)

    # Find and fetch travel-related sub-pages
    sub_pages = find_travel_pages(url, homepage_html)
    extra_text = ''
    for sub_url in sub_pages:
        extra_text += ' ' + fetch_page_text(sub_url)
        time.sleep(0.2)

    full_content = (homepage_text + ' ' + extra_text).strip()
    if not full_content:
        print("no content")
        return None

    # Extract with OpenRouter
    try:
        r = requests.post(
            OPENROUTER_URL,
            headers={
                'Authorization': f'Bearer {OPENROUTER_KEY}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://travelvaccineadvisor.com',
                'X-Title': 'Travel Vaccine Advisor',
            },
            json={
                'model': MODEL,
                'max_tokens': 512,
                'messages': [{
                    'role': 'user',
                    'content': EXTRACT_PROMPT.format(
                        clinic_name=clinic['clinic_name'],
                        country=clinic['country'],
                        content=full_content[:5000]
                    )
                }]
            },
            timeout=30
        )
        raw = r.json()['choices'][0]['message']['content'].strip()
        # Strip markdown code fences if present
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        result = json.loads(raw)
        print(f"✓ ({result.get('highlight', '')})")
        return result
    except Exception as e:
        print(f"extraction error: {e}")
        return None


def safe_write(json_path, data):
    """Write JSON atomically — no corruption on crash."""
    tmp = json_path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, json_path)


def process_file(json_path, label):
    print(f"\n=== {label} ===")
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    enriched = sum(1 for c in data['clinics'] if c.get('content', {}).get('highlight'))
    total = len(data['clinics'])

    for c in data['clinics']:
        # Skip if already enriched
        if c.get('content', {}).get('highlight'):
            print(f"  ✓ {c['clinic_id']} (cached)")
            continue

        result = enrich_clinic(c)
        if result:
            c['content'] = result
            enriched += 1
            # Save after every successful enrichment — crash-safe
            safe_write(json_path, data)
        time.sleep(0.5)

    print(f"\nDone: {enriched}/{total} enriched")


process_file(SG_JSON, 'Singapore')
process_file(MY_JSON, 'Malaysia')
print("\nAll done. Re-run at any time — already-enriched clinics are skipped.")
