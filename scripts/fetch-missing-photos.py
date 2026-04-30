"""
Targeted photo fetch for clinics that the main script missed.
Tries multiple pages per site, lower size threshold, og:image tags.

Usage:
    python scripts/fetch-missing-photos.py YOUR_GOOGLE_API_KEY

Requirements:
    pip install Pillow requests beautifulsoup4
"""

import json, requests, time, os, sys
from PIL import Image
from io import BytesIO
from urllib.parse import urljoin
from bs4 import BeautifulSoup

API_KEY  = sys.argv[1] if len(sys.argv) > 1 else None
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SG_JSON  = os.path.join(BASE_DIR, 'data', 'clinics-sg.json')
MY_JSON  = os.path.join(BASE_DIR, 'data', 'clinics-my.json')
OUT_DIR  = os.path.join(BASE_DIR, 'public', 'images', 'clinics')
TARGET_W, TARGET_H = 800, 450

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,image/*',
}


def crop_and_save(img_bytes, out_path):
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


def try_download_image(url, min_px=200):
    """Download and validate an image URL."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        if r.status_code != 200:
            return None
        img = Image.open(BytesIO(r.content))
        w, h = img.size
        if w >= min_px and h >= min_px:
            return r.content
    except Exception:
        pass
    return None


SKIP = ['logo', 'icon', 'favicon', '.svg', '.gif', 'data:', 'sprite',
        'placeholder', 'arrow', 'button', 'badge', 'star', 'flag']

def extract_images_from_html(html, base_url):
    """Extract all candidate image URLs from HTML, sorted best-first."""
    soup = BeautifulSoup(html, 'html.parser')
    candidates = []

    # 1. og:image — usually the best photo
    og = soup.find('meta', property='og:image')
    if og and og.get('content'):
        candidates.append((1000, urljoin(base_url, og['content'])))

    # 2. twitter:image
    tw = soup.find('meta', attrs={'name': 'twitter:image'})
    if tw and tw.get('content'):
        candidates.append((900, urljoin(base_url, tw['content'])))

    # 3. All img tags
    for img in soup.find_all('img'):
        src = (img.get('src') or img.get('data-src') or
               img.get('data-lazy-src') or img.get('data-original'))
        if not src:
            continue
        src_lower = src.lower()
        if any(s in src_lower for s in SKIP):
            continue
        abs_url = urljoin(base_url, src)
        if not abs_url.startswith('http'):
            continue

        score = 10
        try:
            w = int(img.get('width', 0))
            h = int(img.get('height', 0))
            if w > 200 and h > 150:
                score += w + h
        except (ValueError, TypeError):
            pass

        parent = img.parent
        parent_classes = ' '.join(parent.get('class', [])).lower() if parent else ''
        if any(k in parent_classes for k in ['hero', 'banner', 'slide', 'main', 'about', 'clinic', 'building']):
            score += 500
        if any(k in src_lower for k in ['clinic', 'hospital', 'medical', 'building', 'interior', 'exterior', 'about', 'banner', 'hero']):
            score += 300

        candidates.append((score, abs_url))

    # Sort best-first, deduplicate
    seen = set()
    result = []
    for score, url in sorted(candidates, reverse=True):
        if url not in seen:
            seen.add(url)
            result.append(url)
    return result


def fetch_clinic_photo(clinic):
    url = clinic.get('website_url')
    if not url:
        return None

    # Pages to try: homepage + common sub-pages
    pages_to_try = [url]
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            keywords = ['about', 'clinic', 'travel', 'vaccin', 'services', 'our-clinic', 'facility']
            for a in soup.find_all('a', href=True):
                href = a['href'].lower()
                if any(k in href for k in keywords):
                    full = urljoin(url, a['href'])
                    if full not in pages_to_try:
                        pages_to_try.append(full)
            pages_to_try = pages_to_try[:4]
    except Exception:
        pass

    for page_url in pages_to_try:
        try:
            r = requests.get(page_url, headers=HEADERS, timeout=10)
            if r.status_code != 200:
                continue
            img_urls = extract_images_from_html(r.text, page_url)
            for img_url in img_urls[:8]:
                img_bytes = try_download_image(img_url, min_px=200)
                if img_bytes:
                    return img_bytes
            time.sleep(0.2)
        except Exception:
            continue

    return None


def try_google_places(clinic):
    if not API_KEY:
        return None
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


def process(json_path, label):
    print(f"\n=== {label} ===")
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    fetched = 0
    for c in data['clinics']:
        cid = c['clinic_id']
        out_path = os.path.join(OUT_DIR, f"{cid}.jpg")

        if os.path.exists(out_path):
            c['photo_path'] = f"/images/clinics/{cid}.jpg"
            fetched += 1
            continue

        print(f"  → {c['clinic_name']}...", end=' ', flush=True)

        img_bytes = try_google_places(c) or fetch_clinic_photo(c)

        if not img_bytes:
            print("still no photo — will use placeholder")
            continue

        try:
            crop_and_save(img_bytes, out_path)
            c['photo_path'] = f"/images/clinics/{cid}.jpg"
            fetched += 1
            print(f"✓ ({os.path.getsize(out_path)//1024}KB)")
        except Exception as e:
            print(f"save error: {e}")

        time.sleep(0.4)

    tmp = json_path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, json_path)
    print(f"Done: {fetched}/{len(data['clinics'])}")


process(SG_JSON, 'Singapore')
process(MY_JSON, 'Malaysia')
print("\nAll done.")
