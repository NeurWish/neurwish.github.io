# crawler/parser.py
from urllib.parse import urljoin, urlparse, parse_qs
from bs4 import BeautifulSoup
import os

# YouTube Data API
from googleapiclient.discovery import build

# 請將你的 API Key 設定為環境變數 YOUTUBE_API_KEY
YOUTUBE_API_KEY = os.getenv("AIzaSyBntCX3WMMShp6EMYyZVj4jeYB62g5Y5XI")


def extract_video_id(url):
    parsed = urlparse(url)
    # youtu.be 短連結
    if parsed.hostname in ["youtu.be"]:
        return parsed.path.lstrip("/")
    # youtube.com/watch?v=...
    qs = parse_qs(parsed.query)
    return qs.get("v", [None])[0]


def parse_data(html_pages, base_url):
    """
    根據 base_url 自動選擇不同網站解析器：
      - YouTube 留言
      - PTT (ptt.cc)
      - Dcard (dcard.tw)
      - Pixiv (pixiv.net)
      - 其他一律使用通用解析
    回傳格式：[{id, title, content, link, image_url, [author], [author_channel_id]}, ...]
    """
    # YouTube 留言專用
    if "youtube.com" in base_url or "youtu.be" in base_url:
        return parse_youtube_comments(base_url)
    # PTT
    if "ptt.cc" in base_url:
        return parse_ptt(html_pages, base_url)
    # Dcard
    if "dcard.tw" in base_url:
        return parse_dcard(html_pages, base_url)
    # Pixiv
    if "pixiv.net" in base_url:
        return parse_pixiv(html_pages, base_url)
    # 其他通用
    return parse_generic(html_pages, base_url)


def parse_youtube_comments(video_url, max_results=100):
    """
    使用 YouTube Data API 抓取 top-level comments
    回傳每則留言的 id, content, link, author, author_channel_id
    """
    video_id = extract_video_id(video_url)
    if not video_id or not YOUTUBE_API_KEY:
        return []

    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    results = []
    nextPageToken = None
    idx = 1
    while True:
        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,
            textFormat="plainText",
            pageToken=nextPageToken
        ).execute()
        for item in response.get("items", []):
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            results.append({
                "id": idx,
                "title": "",  # YouTube 不使用 title 欄
                "content": snippet.get("textDisplay", ""),
                "link": video_url,
                "image_url": "",  # 留空
                "author": snippet.get("authorDisplayName"),
                "author_channel_id": snippet.get("authorChannelId", {}).get("value")
            })
            idx += 1
        nextPageToken = response.get("nextPageToken")
        if not nextPageToken or idx > max_results:
            break
    return results


def parse_ptt(html_pages, base_url):
    results = []
    idx = 1
    for html in html_pages:
        soup = BeautifulSoup(html, "html.parser")
        # 每則文章區塊為 div.r-ent
        for entry in soup.select("div.r-ent"):
            a = entry.select_one("div.title a[\href]")
            title = a.get_text(strip=True) if a else ""
            link = urljoin(base_url, a["href"]) if a else ""
            results.append({
                "id": idx,
                "title": title,
                "content": "",
                "link": link,
                "image_url": ""
            })
            idx += 1
    return results


def parse_dcard(html_pages, base_url):
    results = []
    idx = 1
    for html in html_pages:
        soup = BeautifulSoup(html, "html.parser")
        for blk in soup.select("div.PostListEntry_root_V6g0r, div.PostList_entry_1rq5Lf"):
            a = blk.select_one("a[href]")
            link = urljoin(base_url, a["href"]) if a else ""
            title_tag = blk.select_one("h2")
            title = title_tag.get_text(strip=True) if title_tag else ""
            snippet_tag = blk.select_one("span.PostEntry_excerpt, span.PostItem_excerpt")
            content = snippet_tag.get_text(strip=True) if snippet_tag else ""
            img = blk.select_one("img")
            img_url = img.get("data-src") or img.get("src") if img else ""
            image_url = urljoin(base_url, img_url) if img_url else ""
            results.append({
                "id": idx,
                "title": title,
                "content": content,
                "link": link,
                "image_url": image_url
            })
            idx += 1
    return results


def parse_pixiv(html_pages, base_url):
    results = []
    idx = 1
    for html in html_pages:
        soup = BeautifulSoup(html, "html.parser")
        for img in soup.select("img[src*='i.pximg.net']"):
            src = img.get("src")
            results.append({
                "id": idx,
                "title": "",
                "content": "",
                "link": "",
                "image_url": src
            })
            idx += 1
    return results


def parse_generic(html_pages, base_url):
    results = []
    idx = 1
    for html in html_pages:
        soup = BeautifulSoup(html, "html.parser")
        blocks = soup.select("article, div.post, div.entry-content")
        if not blocks:
            blocks = soup.find_all(["h1", "h2", "h3"])

        for blk in blocks:
            h = blk.find(["h1", "h2", "h3"])
            title = h.get_text(strip=True) if h else ""
            a = blk.find("a", href=True)
            link = urljoin(base_url, a["href"]) if a else ""
            p = blk.find("p")
            content = p.get_text(strip=True) if p else ""
            img = blk.find("img", src=True)
            image_url = urljoin(base_url, img["src"]) if img else ""
            results.append({
                "id": idx,
                "title": title,
                "content": content,
                "link": link,
                "image_url": image_url
            })
            idx += 1
    return results
