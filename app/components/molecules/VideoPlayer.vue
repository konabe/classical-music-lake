<script setup lang="ts">
import { isYouTubeUrl, toYouTubeEmbedUrl } from "~/utils/video";

const props = defineProps<{
  videoUrl: string;
}>();

const emit = defineEmits<{
  play: [];
}>();

const isYouTube = computed(() => isYouTubeUrl(props.videoUrl));
const embedUrl = computed(() => toYouTubeEmbedUrl(props.videoUrl));

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (
        elementId: string,
        options: { events: { onStateChange: (event: { data: number }) => void } }
      ) => void;
      PlayerState: { PLAYING: number };
    };
  }
}

const iframeId = `yt-player-${Math.random().toString(36).slice(2)}`;

onMounted(() => {
  if (!isYouTube.value) {
    return;
  }

  const initPlayer = () => {
    new window.YT!.Player(iframeId, {
      events: {
        onStateChange(event: { data: number }) {
          if (event.data === window.YT!.PlayerState.PLAYING) {
            emit("play");
          }
        },
      },
    });
  };

  if (window.YT?.Player !== undefined) {
    initPlayer();
  } else {
    window.onYouTubeIframeAPIReady = initPlayer;
    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]') === null) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }
});
</script>

<template>
  <div class="video-player">
    <iframe v-if="isYouTube" :id="iframeId" :src="embedUrl" class="youtube-iframe" />
    <a
      v-else
      :href="videoUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="external-link"
      @click="emit('play')"
    >
      動画を開く（外部リンク）
    </a>
  </div>
</template>

<style scoped>
.video-player {
  width: 100%;
}

.youtube-iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
  border-radius: 8px;
}

.external-link {
  display: inline-block;
  color: #1e2d5a;
  text-decoration: underline;
  font-size: 0.95rem;
}
</style>
