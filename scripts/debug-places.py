"""
Debug: test Google Places search for one clinic and print raw response.

Usage:
    python scripts/debug-places.py YOUR_API_KEY
"""
import requests, json, sys

API_KEY = sys.argv[1]

# Test with ATA Medical — should definitely be on Google Maps
test_cases = [
    {"name": "ATA Medical Tanjong Pagar", "address": "72 Anson Rd Singapore", "country": "Singapore"},
    {"name": "Minmed Paragon", "address": "290 Orchard Rd Singapore", "country": "Singapore"},
    {"name": "Gleneagles Medini Hospital", "address": "Jalan Medini Utara 4 Iskandar Puteri", "country": "Malaysia"},
]

for t in test_cases:
    query = f"{t['name']} {t['address']}"
    print(f"\nSearching: {query}")
    r = requests.post(
        'https://places.googleapis.com/v1/places:searchText',
        headers={
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.photos,places.formattedAddress',
            'Content-Type': 'application/json',
        },
        json={'textQuery': query, 'maxResultCount': 1},
        timeout=10
    )
    data = r.json()
    places = data.get('places', [])
    if not places:
        print("  ❌ No places found. Full response:", json.dumps(data, indent=2))
    else:
        p = places[0]
        print(f"  ✓ Found: {p.get('displayName', {}).get('text')} — {p.get('formattedAddress')}")
        photos = p.get('photos', [])
        print(f"  Photos: {len(photos)} available")
        if photos:
            print(f"  First photo name: {photos[0]['name']}")
