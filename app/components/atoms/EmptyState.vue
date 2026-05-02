<template>
  <div class="empty-state">
    <span class="empty-mark" aria-hidden="true">&mdash;</span>
    <p class="empty-text"><slot /></p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4.5rem 2rem;
  text-align: center;
  border: 1px dashed var(--color-hairline);
  background: transparent;
}

.empty-mark {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-accent);
  font-style: italic;
}

.empty-text {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  max-width: 32em;
  line-height: 1.5;
}
</style>
