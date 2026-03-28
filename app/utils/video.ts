export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com/watch?v=") || url.includes("youtu.be/");
}

export function extractYouTubeVideoId(url: string): string | null {
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch !== null) return watchMatch[1];

  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch !== null) return shortMatch[1];

  return null;
}

export function toYouTubeEmbedUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (videoId === null) return url;
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
}
