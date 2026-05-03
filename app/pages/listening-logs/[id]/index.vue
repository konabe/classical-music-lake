<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const { data: log } = await useListeningLog(() => route.params.id as string);
const { data: composers, refresh: refreshComposers } = useComposersAll();
await refreshComposers();

const composerId = computed<string | undefined>(() => {
  const name = log.value?.composer;
  if (name === undefined || name === "") {
    return undefined;
  }
  return composers.value?.find((c) => c.name === name)?.id;
});
</script>

<template>
  <ListeningLogDetailTemplate v-if="log" :log="log" :composer-id="composerId" />
</template>
