export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com/watch?v=") || url.includes("youtu.be/");
}

export function extractYouTubeVideoId(url: string): string | null {
  const watchMatch = /youtube\.com\/watch\?v=([^&]+)/.exec(url);
  if (watchMatch !== null) {
    return watchMatch[1];
  }

  const shortMatch = /youtu\.be\/([^?]+)/.exec(url);
  if (shortMatch !== null) {
    return shortMatch[1];
  }

  return null;
}

export function toYouTubeEmbedUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (videoId === null) {
    return url;
  }
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&fs=0`;
}
