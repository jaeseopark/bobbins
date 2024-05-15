import glob
import logging
import os
import queue
import re
import threading
from types import SimpleNamespace
from typing import Callable, List

from yt_dlp import YoutubeDL
import webvtt

logger = logging.getLogger("bobbins")

PROGRESS_CALLBACK_INTERVAL = 0.05
DOWNLOAD_PROGRESS_FACTOR = 0.8  # download takes appx 80% of the processing time

YOUTU_BE_REGEX = re.compile("https://youtu\.be/([a-zA-Z0-9-]*)")

q = queue.Queue()


def worker():
    while True:
        func = q.get()
        func()
        q.task_done()


threading.Thread(target=worker, daemon=True).start()

# TODO: refactor download
def generate_transcript_pdf(product: dict, callback: Callable[[dict], None]) -> None:
    def func():
        product_id = product.get("id")
        tutorial_link = product.get("tutorialLink")
        assert tutorial_link, "tutorial_link is not present"

        # Note: primitive variables cannot be modified in an inner function scope.
        progress = SimpleNamespace(now=0, last_reported=0)

        def download_progress_hook(data: dict):
            if data['status'] == 'downloading':
                numerator = float(data.get("downloaded_bytes") or 0)
                denominator = float(data.get("total_bytes") or 0)

                if denominator == 0 or numerator == denominator:
                    return

                progress.now = numerator/denominator
                if progress.now > progress.last_reported + PROGRESS_CALLBACK_INTERVAL:
                    callback(dict(
                        id=product_id,
                        progress=progress.now * DOWNLOAD_PROGRESS_FACTOR,
                    ))
                    progress.last_reported = progress.now
            elif data['status'] == 'complete':
                pass

        options = dict(
            format="[filesize<100M]",
            writesubtitles=True,
            subtitleslangs="en",
            outtmpl=f'/products/{product_id}-transcript.%(ext)s',
            progress_hooks=[download_progress_hook]
        )

        with YoutubeDL(options) as ydl:
            ydl.download([tutorial_link])

        subtitles_path = f'/products/{product_id}-transcript.en.vtt'
        assert os.path.exists(subtitles_path), "Subtitles do not exist."

        for caption in webvtt.read(subtitles_path):
            print(caption.start)
            print(caption.end)
            print(caption.text)

        callback(dict(
            id=product_id,
            progress=1,
        ))

    q.put(func)


def get_video_unique_id_str(tutorial_link: str) -> str:
    if 'youtu.be' in tutorial_link:
        # ex: https://youtu.be/pj4NhbLNUU4?si=123
        match = YOUTU_BE_REGEX.match(tutorial_link)
        if match:
            return match[1]

    raise RuntimeError("Cannot find the unique string in the tutorial link")


def get_stats(product: dict) -> List[dict]:
    product_id = product.get("id")
    tutorial_link = product.get("tutorialLink", "")
    unique_str = get_video_unique_id_str(tutorial_link)

    def to_stats(path: str) -> dict:
        stat = os.stat(path)
        return dict(
            path=path,
            size=stat.st_size,
            ctime=stat.st_ctime,
            progress=1.0
        )

    return [to_stats(path) for path in glob.glob(f"/products/{product_id}-{unique_str}-*")]
