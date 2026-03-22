<template>
  <div class="home">
    <section class="hero">
      <h1>Nocturne</h1>
      <p>鑑賞した音楽を、静かに記録する。</p>
    </section>
    <section class="menu-cards">
      <NuxtLink to="/listening-logs" class="card">
        <span class="card-icon">🎼</span>
        <h2>鑑賞記録</h2>
        <p>CD・配信・YouTubeなどで聴いた演奏を記録する</p>
      </NuxtLink>
    </section>
    <section class="admin-links">
      <ul>
        <li><NuxtLink to="/pieces">楽曲マスタ</NuxtLink></li>
        <li><a href="/storybook/" target="_blank" rel="noopener">Storybook</a></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
}

.hero h1 {
  font-size: 3rem;
  color: #1e2d5a;
  margin-bottom: 1rem;
  letter-spacing: 0.12em;
  font-style: italic;
}

.hero p {
  font-size: 1rem;
  color: #6b7a99;
  letter-spacing: 0.05em;
}

.menu-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.card {
  display: block;
  background: #eaeef4;
  border: 1px solid #9aa5b4;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  text-align: center;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.card h2 {
  font-size: 1.4rem;
  color: #1e2d5a;
  margin-bottom: 0.5rem;
}

.card p {
  color: #888;
  font-size: 0.95rem;
}

.admin-links {
  margin-top: 3rem;
  text-align: center;
}

.admin-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.admin-links a {
  color: #888;
  font-size: 0.85rem;
  text-decoration: none;
}

.admin-links a:hover {
  text-decoration: underline;
}
</style>
