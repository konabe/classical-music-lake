<script setup lang="ts">
const { isAuthenticated, logout } = useAuth();
const route = useRoute();
const isLoggedIn = ref(isAuthenticated());
watch(
  () => route.path,
  () => {
    isLoggedIn.value = isAuthenticated();
  },
);
</script>

<template>
  <div class="app">
    <header class="app-header">
      <nav>
        <NuxtLink to="/" class="logo">
          <img src="/logo.svg" alt="Nocturne" class="logo-img" />
          <span class="logo-text">Nocturne</span>
        </NuxtLink>
        <ul class="nav-links">
          <li><NuxtLink to="/listening-logs">鑑賞記録</NuxtLink></li>
          <li><NuxtLink to="/pieces">楽曲マスタ</NuxtLink></li>
          <li><NuxtLink to="/composers">作曲家マスタ</NuxtLink></li>
          <li><NuxtLink to="/concert-logs">コンサート記録</NuxtLink></li>
        </ul>
        <ul v-if="!isLoggedIn" class="auth-links">
          <li><NuxtLink to="/auth/user-register">新規登録</NuxtLink></li>
          <li><NuxtLink to="/auth/login">ログイン</NuxtLink></li>
        </ul>
        <button v-if="isLoggedIn" class="logout-button" @click="logout">ログアウト</button>
        <div class="theme-toggle-wrapper" :class="{ 'auth-aligned': !isLoggedIn }">
          <ThemeToggle />
        </div>
      </nav>
    </header>
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-header {
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
  padding: 1rem 2rem;
}

.app-header nav {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
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

.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--color-header-text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-header-text);
}

.auth-links {
  list-style: none;
  display: flex;
  gap: 1.2rem;
  margin-left: auto;
}

.auth-links a {
  color: var(--color-header-text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
  white-space: nowrap;
}

.auth-links a:hover {
  color: var(--color-header-text);
}

.logout-button {
  margin-left: auto;
  background: none;
  border: 1px solid var(--color-header-text-muted);
  color: var(--color-header-text-muted);
  padding: 0.35rem 0.9rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.logout-button:hover {
  background-color: var(--color-header-text-muted);
  color: var(--color-header-bg);
}

.theme-toggle-wrapper {
  display: flex;
  align-items: center;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 600px) {
  .app-header {
    padding: 0.75rem 0.75rem;
  }

  .app-header nav {
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  .logo {
    gap: 0.4rem;
  }

  .logo-img {
    height: 26px;
  }

  .logo-text {
    display: none;
  }

  .nav-links {
    gap: 0.6rem;
  }

  .nav-links a,
  .auth-links a {
    font-size: 0.85rem;
  }

  .auth-links {
    gap: 0.6rem;
  }

  .logout-button {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  .app-main {
    padding: 1rem;
  }
}
</style>
