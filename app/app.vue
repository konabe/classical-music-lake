<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Georgia", serif;
  background-color: var(--color-bg-base);
  color: var(--color-text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
</style>
