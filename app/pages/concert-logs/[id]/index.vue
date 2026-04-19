<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const { data: log } = await useConcertLog(() => {
  return route.params.id as string;
});
</script>

<template>
  <ConcertLogDetailTemplate v-if="log" :log="log" />
</template>
