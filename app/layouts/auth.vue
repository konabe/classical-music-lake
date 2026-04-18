<template>
  <div class="auth-layout">
    <header class="auth-header">
      <NuxtLink to="/" class="logo" aria-label="ホームに戻る">
        <img src="/logo.svg" alt="Nocturne" class="logo-img" />
        <span class="logo-text">Nocturne</span>
      </NuxtLink>
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
  background-color: #1e2d5a;
  color: #fff;
  padding: 1rem 2rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-img {
  height: 32px;
  width: auto;
  filter: brightness(0) invert(1);
}

.logo-text {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
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
