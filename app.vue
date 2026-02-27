<template>
  <div class="app">
    <header class="app-header">
      <nav>
        <NuxtLink to="/" class="logo">🎵 Classical Music Lake</NuxtLink>
        <ul class="nav-links">
          <li><NuxtLink to="/listening-logs">鑑賞記録</NuxtLink></li>
          <li><NuxtLink to="/concerts">コンサート記録</NuxtLink></li>
        </ul>
      </nav>
    </header>
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Georgia', serif;
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

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
