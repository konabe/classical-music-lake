<template>
  <div class="app">
    <header class="app-header">
      <nav>
        <NuxtLink to="/" class="logo">🎵 Classical Music Lake</NuxtLink>
        <ul class="nav-links">
          <li><NuxtLink to="/listening-logs">鑑賞記録</NuxtLink></li>
        </ul>
        <button v-if="isAuthenticated()" class="logout-button" @click="logout">ログアウト</button>
      </nav>
    </header>
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, logout } = useAuth();
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Georgia", serif;
  background-color: #faf8f5;
  color: #2c2c2c;
}

.app-header {
  background-color: #1a1a2e;
  color: #fff;
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
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #d4c9a8;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #fff;
}

.logout-button {
  margin-left: auto;
  background: none;
  border: 1px solid #d4c9a8;
  color: #d4c9a8;
  padding: 0.35rem 0.9rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.logout-button:hover {
  background-color: #d4c9a8;
  color: #1a1a2e;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
