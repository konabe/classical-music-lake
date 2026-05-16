<script setup lang="ts">
import { extractYouTubeVideoId, isYouTubeUrl } from "@/utils/video";

const props = defineProps<{
  videoUrl: string | undefined;
  alt: string;
}>();

const hasLoadError = ref(false);

const videoId = computed(() => {
  if (props.videoUrl === undefined) {
    return null;
  }
  if (!isYouTubeUrl(props.videoUrl)) {
    return null;
  }
  return extractYouTubeVideoId(props.videoUrl);
});

const thumbnailUrl = computed(() => {
  if (videoId.value === null) {
    return null;
  }
  return `https://img.youtube.com/vi/${videoId.value}/mqdefault.jpg`;
});

const handleError = () => {
  hasLoadError.value = true;
};
</script>

<template>
  <img
    v-if="thumbnailUrl !== null && !hasLoadError"
    :src="thumbnailUrl"
    :alt="alt"
    class="youtube-thumbnail"
    width="160"
    height="90"
    loading="lazy"
    decoding="async"
    @error="handleError"
  />
</template>

<style scoped>
.youtube-thumbnail {
  display: block;
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--color-bg-elevated);
}
</style>
