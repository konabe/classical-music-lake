<script setup lang="ts">
import type { PieceMovement } from "~/types";
import { isYouTubeUrl, toYouTubeEmbedUrl } from "~/utils/video";

const props = defineProps<{
  movement: PieceMovement;
}>();

const displayIndex = computed(() => (props.movement.index + 1).toString().padStart(2, "0"));

const youtubeEmbedUrls = computed(() =>
  (props.movement.videoUrls ?? []).filter(isYouTubeUrl).map(toYouTubeEmbedUrl),
);

const externalUrls = computed(() =>
  (props.movement.videoUrls ?? []).filter((url) => !isYouTubeUrl(url)),
);
</script>

<template>
  <article class="movement-list-item">
    <header class="movement-head">
      <span class="movement-index smallcaps numeric">N&deg; {{ displayIndex }}</span>
      <h3 class="movement-title">{{ movement.title }}</h3>
    </header>

    <div v-if="youtubeEmbedUrls.length > 0" class="movement-videos">
      <div
        v-for="(embedUrl, i) in youtubeEmbedUrls"
        :key="`${movement.id}-yt-${i}`"
        class="movement-video"
      >
        <iframe
          :src="embedUrl"
          class="movement-iframe"
          title="YouTube 動画プレーヤー"
          allowfullscreen
        />
      </div>
    </div>

    <ul v-if="externalUrls.length > 0" class="movement-external-links">
      <li v-for="(url, i) in externalUrls" :key="`${movement.id}-ext-${i}`">
        <a :href="url" target="_blank" rel="noopener noreferrer" class="external-link">
          動画を開く（外部リンク）
        </a>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.movement-list-item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--color-hairline);
}

.movement-head {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.movement-index {
  color: var(--color-text-faint);
  flex: 0 0 auto;
}

.movement-title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.3;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.movement-videos {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.4rem;
}

.movement-video {
  width: 100%;
}

.movement-iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--color-hairline);
  border-radius: 6px;
}

.movement-external-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.external-link {
  color: var(--color-text);
  text-decoration: underline;
  font-size: 0.92rem;
}

.external-link:hover {
  color: var(--color-accent);
}
</style>
