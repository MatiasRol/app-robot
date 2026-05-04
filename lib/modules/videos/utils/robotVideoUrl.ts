const ROBOT_VIDEO_BASE_URL =
  process.env.EXPO_PUBLIC_ROBOT_VIDEO_BASE_URL || 'http://Xico.local:8000';

function normalizeVideoId(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.replace(/\.[^.]+$/, '');
}

export function buildRobotVideoStreamUrl(videoFileName?: string | null) {
  const videoId = normalizeVideoId(videoFileName);
  if (!videoId) return null;

  return `${ROBOT_VIDEO_BASE_URL}/media/videos/${encodeURIComponent(videoId)}/stream`;
}

export function buildRobotVideoDownloadUrl(videoFileName?: string | null) {
  const videoId = normalizeVideoId(videoFileName);
  if (!videoId) return null;

  return `${ROBOT_VIDEO_BASE_URL}/media/videos/${encodeURIComponent(videoId)}/download`;
}