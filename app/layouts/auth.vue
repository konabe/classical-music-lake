<template>
  <div class="auth-layout">
    <header class="auth-masthead">
      <div class="auth-masthead-inner">
        <NuxtLink to="/" class="logo" aria-label="ホームに戻る">
          <span class="logo-text">Nocturne</span>
          <span class="logo-mark" aria-hidden="true">&#9839;</span>
        </NuxtLink>
        <ThemeToggle />
      </div>
    </header>
    <main class="auth-main">
      <span class="auth-side-mark" aria-hidden="true">N&deg;01</span>
      <slot />
      <div class="auth-footnote smallcaps" aria-hidden="true">
        a quarterly of classical listening
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-base);
  position: relative;
}

.auth-masthead {
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
  position: relative;
}

.auth-masthead::before,
.auth-masthead::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-accent) 20%,
    var(--color-accent) 80%,
    transparent 100%
  );
  opacity: 0.45;
}
.auth-masthead::before {
  top: 0;
}
.auth-masthead::after {
  bottom: 0;
}

.auth-masthead-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.1rem 2.5rem;
}

.logo {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  text-decoration: none;
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: 1.7rem;
  letter-spacing: -0.01em;
  color: var(--color-header-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.logo-mark {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-accent);
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  position: relative;
  isolation: isolate;
}

.auth-main::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 25% 30%, rgba(176, 138, 62, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 75% 70%, rgba(110, 31, 43, 0.04) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

:root.dark .auth-main::before {
  background:
    radial-gradient(ellipse at 25% 30%, rgba(212, 173, 92, 0.1) 0%, transparent 60%),
    radial-gradient(ellipse at 75% 70%, rgba(184, 89, 104, 0.06) 0%, transparent 50%);
}

.auth-side-mark {
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: left center;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--color-accent);
  letter-spacing: 0.12em;
  opacity: 0.7;
  white-space: nowrap;
}

.auth-footnote {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-text-muted);
  font-style: italic;
}

@media (max-width: 760px) {
  .auth-masthead-inner {
    padding: 0.9rem 1.2rem;
  }

  .auth-main {
    padding: 2rem 1.2rem 4rem;
  }

  .auth-side-mark {
    display: none;
  }
}
</style>
