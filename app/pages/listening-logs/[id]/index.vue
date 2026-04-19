<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const { data: log } = await useListeningLog(() => {
  return route.params.id as string;
});
</script>

<template>
  <ListeningLogDetailTemplate v-if="log" :log="log" />
</template>
