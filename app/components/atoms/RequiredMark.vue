<template>
  <span class="required" aria-label="必須">required</span>
</template>

<style scoped>
.required {
  display: inline-block;
  margin-left: 0.4rem;
  padding: 0;
  background: none;
  color: var(--color-bordeaux);
  font-family: var(--font-sans);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  line-height: 1;
  vertical-align: middle;
  position: relative;
  padding-left: 0.6rem;
}

.required::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0.35rem;
  height: 1px;
  background: var(--color-bordeaux);
}

:root.dark .required {
  color: var(--color-bordeaux);
  filter: brightness(1.2);
}
:root.dark .required::before {
  background: currentColor;
}
</style>
