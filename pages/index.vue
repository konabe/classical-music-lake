<template>
  <div class="home">
    <section class="hero">
      <h1>Classical Music Lake</h1>
      <p>クラシック音楽の鑑賞体験を記録・振り返るためのアプリです。</p>
    </section>
    <section class="menu-cards">
      <NuxtLink to="/listening-logs" class="card">
        <span class="card-icon">🎼</span>
        <h2>鑑賞記録</h2>
        <p>曲・演奏家・感想・評価を記録する</p>
      </NuxtLink>
      <NuxtLink to="/concerts" class="card">
        <span class="card-icon">🏛️</span>
        <h2>コンサート記録</h2>
        <p>参加した公演のプログラムや感想を残す</p>
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  color: #1a1a2e;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.1rem;
  color: #666;
}

.menu-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.card {
  display: block;
  background: #fff;
  border: 1px solid #e0d8cc;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s, transform 0.2s;
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
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.card p {
  color: #888;
  font-size: 0.95rem;
}
</style>
