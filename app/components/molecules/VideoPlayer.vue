<script setup lang="ts">
import { isYouTubeUrl, toYouTubeEmbedUrl } from "~/utils/video";

const props = withDefaults(
  defineProps<{
    videoUrl: string;
    autoplay?: boolean;
  }>(),
  { autoplay: false }
);

const emit = defineEmits<{
  play: [];
}>();

const isYouTube = computed(() => isYouTubeUrl(props.videoUrl));
const embedUrl = computed(() => {
  const base = toYouTubeEmbedUrl(props.videoUrl);
  return props.autoplay ? `${base}&autoplay=1` : base;
});

type YTPlayer = { destroy: () => void };

declare global {
  var onYouTubeIframeAPIReady: (() => void) | undefined;

  var YT:
    | {
        Player: new (
          elementId: string,
          options: { events: { onStateChange: (event: { data: number }) => void } }
        ) => YTPlayer;
        PlayerState: { PLAYING: number };
      }
    | undefined;
}

const iframeId = `yt-player-${Math.random().toString(36).slice(2)}`; // NOSONAR: セキュリティ目的ではなく DOM 要素の一意 ID 生成に使用
let player: YTPlayer | undefined;

onMounted(() => {
  if (!isYouTube.value) {
    return;
  }

  const initPlayer = () => {
    // YT.Player は内部的に DOM 要素にバインドされるため、
    // インスタンスを保持してイベント監視を有効にする
    player = new globalThis.YT!.Player(iframeId, {
      events: {
        onStateChange(event: { data: number }) {
          if (event.data === globalThis.YT!.PlayerState.PLAYING) {
            emit("play");
          }
        },
      },
    });
  };

  if (globalThis.YT?.Player === undefined) {
    globalThis.onYouTubeIframeAPIReady = initPlayer;
    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]') === null) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  } else {
    initPlayer();
  }
});

onUnmounted(() => {
  player?.destroy();
});
</script>

<template>
  <div class="video-player">
    <iframe
      v-if="isYouTube"
      :id="iframeId"
      :src="embedUrl"
      class="youtube-iframe"
      title="YouTube 動画プレーヤー"
      allow="autoplay"
    />
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
  color: var(--color-text);
  text-decoration: underline;
  font-size: 0.95rem;
}
</style>
