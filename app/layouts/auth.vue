<template>
  <div class="auth-layout">
    <header class="auth-header">
      <div class="auth-header-inner">
        <NuxtLink to="/" class="logo" aria-label="ホームに戻る">
          <img src="/logo.svg" alt="Nocturne" class="logo-img" />
          <span class="logo-text">Nocturne</span>
        </NuxtLink>
        <ThemeToggle />
      </div>
    </header>
    <main class="auth-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.auth-header {
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
  padding: 1rem 2rem;
}

.auth-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
  filter: var(--logo-filter);
}

.logo-text {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--color-header-text);
  letter-spacing: 0.08em;
  font-style: italic;
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

@media (max-width: 600px) {
  .auth-header {
    padding: 0.75rem;
  }

  .logo-img {
    height: 26px;
  }

  .auth-main {
    padding: 1rem;
  }
}
</style>
