import requests
from urllib.parse import urlencode

def fetch_pages(base_url, keyword, num_pages):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    html_list = []

    for page in range(1, num_pages + 1):
        params = {"q": keyword, "page": page}
        full_url = f"{base_url}?{urlencode(params)}"
        try:
            response = requests.get(full_url, headers=headers, timeout=10)
            response.raise_for_status()
            html_list.append(response.text)
        except requests.RequestException as e:
            print(f"Error fetching page {page}: {e}")

    return html_list
