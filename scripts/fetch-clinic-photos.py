"""
Fetch clinic photos — tries Google Places API first, falls back to scraping
the clinic's own website for a hero image.

Usage (from the 03-site folder):
    python scripts/fetch-clinic-photos.py YOUR_GOOGLE_API_KEY

Requirements:
    pip install Pillow requests beautifulsoup4
"""

import json, requests, time, os, sys
from PIL import Image
from io import BytesIO
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

if len(sys.argv) < 2:
    print("Usage: python scripts/fetch-clinic-photos.py YOUR_API_KEY")
    sys.exit(1)

API_KEY  = sys.argv[1]
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SG_JSON  = os.path.join(BASE_DIR, 'data', 'clinics-sg.json')
MY_JSON  = os.path.join(BASE_DIR, 'data', 'clinics-my.json')
OUT_DIR  = os.path.join(BASE_DIR, 'public', 'images', 'clinics')
TARGET_W, TARGET_H = 800, 450
MIN_IMG_PX = 300  # ignore tiny images (icons, logos)

os.makedirs(OUT_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; TravelVaccineAdvisor/1.0)',
    'Accept': 'text/html,application/xhtml+xml,image/*',
}


# ── Image processing ──────────────────────────────────────────────────────────

def crop_and_save(img_bytes, out_path):
    """Centre-crop to 16:9 and save at 800×450."""
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    w, h = img.size
    ratio = TARGET_W / TARGET_H
    if w / h > ratio:
        new_w = int(h * ratio)
        img = img.crop(((w - new_w) // 2, 0, (w + new_w) // 2, h))
    else:
        new_h = int(w / ratio)
        img = img.crop((0, (h - new_h) // 2, w, (h + new_h) // 2))
    img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    img.save(out_path, 'JPEG', quality=82, optimize=True)


# ── Source 1: Google Places API ───────────────────────────────────────────────

def try_google_places(clinic):
    query = f"{clinic['clinic_name']} {clinic.get('address', '')} {clinic['country']}"
    try:
        r = requests.post(
            'https://places.googleapis.com/v1/places:searchText',
            headers={
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'places.id,places.photos',
                'Content-Type': 'application/json',
            },
            json={'textQuery': query, 'maxResultCount': 1},
            timeout=10
        )
        places = r.json().get('places', [])
        if not places:
            return None
        photos = places[0].get('photos', [])
        if not photos:
            return None
        photo_url = f"https://places.googleapis.com/v1/{photos[0]['name']}/media?maxWidthPx=1200&key={API_KEY}"
        img_r = requests.get(photo_url, timeout=15)
        if img_r.status_code == 200:
            return img_r.content
    except Exception:
        pass
    return None


# ── Source 2: Clinic's own website ───────────────────────────────────────────

SKIP_PATTERNS = ['logo', 'icon', 'favicon', 'banner-text', 'sprite',
                 'avatar', 'placeholder', 'flag', 'arrow', 'button',
                 '.svg', '.gif', 'data:image']

def score_image(img_tag, base_url):
    """Return (score, absolute_url) for an img tag. Higher = better candidate."""
    src = img_tag.get('src') or img_tag.get('data-src') or img_tag.get('data-lazy-src')
    if not src:
        return 0, None
    src_lower = src.lower()
    if any(p in src_lower for p in SKIP_PATTERNS):
        return 0, None
    abs_url = urljoin(base_url, src)
    if not abs_url.startswith('http'):
        return 0, None

    score = 1
    # Prefer large declared dimensions
    try:
        w = int(img_tag.get('width', 0))
        h = int(img_tag.get('height', 0))
        if w >= MIN_IMG_PX and h >= MIN_IMG_PX:
            score += w + h
    except (ValueError, TypeError):
        pass
    # Prefer images in hero/main content areas
    parent_classes = ' '.join(
        img_tag.parent.get('class', []) if img_tag.parent else []
    ).lower()
    if any(k in parent_classes for k in ['hero', 'banner', 'main', 'clinic', 'about', 'header']):
        score += 500
    # Boost clinic/facility keywords in filename
    if any(k in src_lower for k in ['clinic', 'hospital', 'medical', 'centre', 'center', 'building', 'interior', 'exterior']):
        score += 300
    return score, abs_url


def try_website_scrape(clinic):
    url = clinic.get('website_url')
    if not url:
        return None
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')

        candidates = []
        for img in soup.find_all('img'):
            score, abs_url = score_image(img, url)
            if score > 0 and abs_url:
                candidates.append((score, abs_url))

        # Sort by score descending, try top 5
        candidates.sort(reverse=True)
        for _, img_url in candidates[:5]:
            try:
                img_r = requests.get(img_url, headers=HEADERS, timeout=10)
                if img_r.status_code != 200:
                    continue
                # Validate it's actually an image and big enough
                img = Image.open(BytesIO(img_r.content))
                w, h = img.size
                if w >= MIN_IMG_PX and h >= MIN_IMG_PX:
                    return img_r.content
            except Exception:
                continue
    except Exception:
        pass
    return None


# ── Main ──────────────────────────────────────────────────────────────────────

def process_clinics(json_path, label):
    print(f"\n=== {label} ===")
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    fetched = 0
    for c in data['clinics']:
        cid      = c['clinic_id']
        out_path = os.path.join(OUT_DIR, f"{cid}.jpg")

        if os.path.exists(out_path):
            print(f"  ✓ {cid} (cached)")
            c['photo_path'] = f"/images/clinics/{cid}.jpg"
            fetched += 1
            continue

        print(f"  → {c['clinic_name']}...", end=' ', flush=True)

        # Try Google Places first
        img_bytes = try_google_places(c)
        source = 'places'

        # Fall back to website scraping
        if not img_bytes:
            img_bytes = try_website_scrape(c)
            source = 'website'

        if not img_bytes:
            print("no photo found")
            continue

        try:
            crop_and_save(img_bytes, out_path)
            c['photo_path'] = f"/images/clinics/{cid}.jpg"
            fetched += 1
            size_kb = os.path.getsize(out_path) // 1024
            print(f"saved via {source} ({size_kb} KB)")
        except Exception as e:
            print(f"save failed: {e}")

        time.sleep(0.3)

    tmp = json_path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, json_path)

    print(f"Done: {fetched}/{len(data['clinics'])} photos")


process_clinics(SG_JSON, 'Singapore')
process_clinics(MY_JSON, 'Malaysia')
print("\nAll done. Re-run at any time — cached photos are skipped.")
