from typing import Dict, List, Any

import requests

# ------------------------------------------------------------------
# API keys / credentials
# ------------------------------------------------------------------
# NOTE: For a real project, do NOT hard‑code secrets in source code.
# This is for local experimentation only.

YOUTUBE_API_KEY = "AIzaSyBA8SliQAiCkAeeG0AnPJ4WbTZopUhLQII"


def _safe_get(url: str, params=None, headers=None) -> Any:
    """
    Helper to call external APIs safely.
    Returns parsed JSON or None on failure.
    """
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=8)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        # Fail silently – recommendations are optional
        return None


def get_youtube_courses(skill: str, max_results: int = 5) -> List[Dict[str, str]]:
    """
    Fetch top YouTube course-style videos for a given skill.
    Uses YouTube Data API v3 and ranks videos by a simple
    score based on views and likes, then returns the top
    `max_results` items.
    """
    api_key = YOUTUBE_API_KEY
    if not api_key:
        return []

    query = f"{skill} course for beginners"

    search_data = _safe_get(
        "https://www.googleapis.com/youtube/v3/search",
        params={
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": 10,
            "key": api_key,
        },
    )

    if not search_data or "items" not in search_data:
        return []

    video_ids = [
        item["id"].get("videoId")
        for item in search_data["items"]
        if item.get("id") and item["id"].get("videoId")
    ]

    if not video_ids:
        return []

    # Fetch statistics (views / likes) for ranking
    details_data = _safe_get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={
            "part": "snippet,statistics",
            "id": ",".join(video_ids),
            "key": api_key,
        },
    )

    if not details_data or "items" not in details_data:
        return []

    scored_videos = []
    for item in details_data["items"]:
        video_id = item.get("id")
        snippet = item.get("snippet", {}) or {}
        stats = item.get("statistics", {}) or {}

        if not video_id:
            continue

        try:
            views = int(stats.get("viewCount", 0))
        except (TypeError, ValueError):
            views = 0

        try:
            likes = int(stats.get("likeCount", 0))
        except (TypeError, ValueError):
            likes = 0

        # Simple ranking score: heavily weight views, lightly weight likes
        score = views + (likes * 50)

        thumbnails = snippet.get("thumbnails", {}) or {}
        thumb_url = (
            thumbnails.get("high", {}).get("url")
            or thumbnails.get("medium", {}).get("url")
            or thumbnails.get("default", {}).get("url")
        )

        scored_videos.append(
            {
                "video_id": video_id,
                "title": snippet.get("title", "YouTube Course"),
                "thumbnail_url": thumb_url,
                "view_count": views,
                "like_count": likes,
                "score": score,
            }
        )

    # Sort by score descending and take the top N
    scored_videos.sort(key=lambda v: v["score"], reverse=True)
    top_videos = scored_videos[:max_results]

    courses = []
    for item in top_videos:
        video_id = item["video_id"]
        courses.append(
            {
                "provider": "YouTube",
                "title": item["title"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail_url": item["thumbnail_url"],
                "view_count": item["view_count"],
                "like_count": item["like_count"],
            }
        )

    return courses


def get_coursera_courses(skill: str, max_results: int = 3) -> List[Dict[str, str]]:
    """
    Placeholder: Coursera recommendations are currently disabled.
    """
    return []


def get_udemy_courses(skill: str, max_results: int = 3) -> List[Dict[str, str]]:
    """
    Placeholder: Udemy recommendations are currently disabled.
    """
    return []


def get_course_recommendations(
    missing_skills: List[str],
) -> Dict[str, List[Dict[str, str]]]:
    """
    Given a list of missing skills, return a mapping:
    {
        "skill_name": [
            { "provider": "...", "title": "...", "url": "..." },
            ...
        ]
    }
    """
    recommendations: Dict[str, List[Dict[str, str]]] = {}

    for skill in missing_skills:
        skill_lower = skill.lower()
        courses: List[Dict[str, str]] = []

        # YouTube only: top 4–5 videos by views/likes
        courses.extend(get_youtube_courses(skill_lower, max_results=5))

        if not courses:
            continue

        recommendations[skill] = courses

    return recommendations

