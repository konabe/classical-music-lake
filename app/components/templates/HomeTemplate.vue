<script setup lang="ts">
import type { Piece } from "~/types";
import FeaturedPiece from "~/components/organisms/FeaturedPiece.vue";

defineProps<{
  pieces: Piece[];
  loading: boolean;
  isAdmin: boolean;
  composerNameById: Record<string, string>;
}>();
</script>

<template>
  <div class="home">
    <section class="hero">
      <svg
        class="hero-deco"
        viewBox="0 0 600 320"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <!--
          五線譜（トレブル譜表）
          各線の音: 第1線=E4, 第2線=G4, 第3線=B4, 第4線=D5, 第5線=F5
          各間の音: 第1間=F4, 第2間=A4, 第3間=C5, 第4間=E5
          1段 = 10px (半音1つ分)

          ロ短調スケール上行: B4 → C#5 → D5 → E5 → F#5 → G5
            B4  第3線    y=160
            C#5 第3間    y=150  (♯)
            D5  第4線    y=140  } ♫ ビーム付き八分音符
            E5  第4間    y=130  }
            F#5 第5線    y=120  (♯)
            G5  第5線の上 y=110
        -->
        <g class="staff-lines" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" fill="none">
          <line x1="0" y1="120" x2="600" y2="120" />
          <line x1="0" y1="140" x2="600" y2="140" />
          <line x1="0" y1="160" x2="600" y2="160" />
          <line x1="0" y1="180" x2="600" y2="180" />
          <line x1="0" y1="200" x2="600" y2="200" />
        </g>

        <!-- note-1: B4（第3線 / 主音）四分音符 符幹↑ -->
        <g class="note note-1" fill="rgba(255,255,255,0.20)">
          <ellipse cx="58" cy="160" rx="13" ry="9" transform="rotate(-20 58 160)" />
          <rect x="70" y="106" width="2.5" height="54" />
        </g>

        <!-- note-2: C#5（第3間）四分音符+♯ 符幹↓ -->
        <g class="note note-2" fill="rgba(255,255,255,0.24)">
          <g stroke="rgba(255,255,255,0.24)" stroke-width="1.5" stroke-linecap="round" fill="none">
            <line x1="139" y1="143" x2="137" y2="157" />
            <line x1="145" y1="143" x2="143" y2="157" />
            <line x1="135" y1="147" x2="149" y2="145" />
            <line x1="135" y1="153" x2="149" y2="151" />
          </g>
          <ellipse cx="163" cy="150" rx="13" ry="9" transform="rotate(-20 163 150)" />
          <rect x="150" y="150" width="2.5" height="62" />
        </g>

        <!-- note-3: D5+E5 ビーム付き八分音符（♫）符幹↓ -->
        <g class="note note-3" fill="rgba(255,255,255,0.18)">
          <!-- D5（第4線） -->
          <ellipse cx="252" cy="140" rx="13" ry="9" transform="rotate(-20 252 140)" />
          <rect x="239" y="140" width="2.5" height="62" />
          <!-- E5（第4間） -->
          <ellipse cx="308" cy="130" rx="13" ry="9" transform="rotate(-20 308 130)" />
          <rect x="295" y="130" width="2.5" height="62" />
          <!-- ビーム: 符幹下端を右上がりで繋ぐ -->
          <path d="M239,202 L297.5,192 L297.5,186 L239,196 Z" />
        </g>

        <!-- note-4: F#5（第5線）四分音符+♯ 符幹↓ -->
        <g class="note note-4" fill="rgba(255,255,255,0.21)">
          <g stroke="rgba(255,255,255,0.21)" stroke-width="1.5" stroke-linecap="round" fill="none">
            <line x1="390" y1="113" x2="388" y2="127" />
            <line x1="396" y1="113" x2="394" y2="127" />
            <line x1="386" y1="117" x2="400" y2="115" />
            <line x1="386" y1="123" x2="400" y2="121" />
          </g>
          <ellipse cx="414" cy="120" rx="13" ry="9" transform="rotate(-20 414 120)" />
          <rect x="401" y="120" width="2.5" height="62" />
        </g>

        <!-- note-5: G5（第5線の上の間）四分音符 符幹↓ -->
        <g class="note note-5" fill="rgba(255,255,255,0.14)">
          <ellipse cx="508" cy="110" rx="13" ry="9" transform="rotate(-20 508 110)" />
          <rect x="495" y="110" width="2.5" height="62" />
        </g>
      </svg>

      <div class="hero-content">
        <h1 class="hero-title">Nocturne</h1>
        <p class="hero-sub">鑑賞した音楽を、静かに記録する。</p>
        <div class="hero-cta">
          <NuxtLink to="/listening-logs" class="cta-primary">鑑賞記録を残す</NuxtLink>
          <NuxtLink to="/pieces" class="cta-ghost">楽曲を探す →</NuxtLink>
        </div>
      </div>
    </section>

    <section class="featured-section">
      <FeaturedPiece :pieces="pieces" :loading="loading" :composer-name-by-id="composerNameById" />
    </section>

    <section class="menu-cards">
      <NuxtLink to="/listening-logs" class="card">
        <span class="card-icon">🎼</span>
        <h2>鑑賞記録</h2>
        <p>CD・配信・YouTubeなどで聴いた演奏を記録する</p>
      </NuxtLink>
      <NuxtLink to="/pieces" class="card">
        <span class="card-icon">🎵</span>
        <h2>楽曲を探す</h2>
        <p>登録された楽曲一覧を探索する</p>
      </NuxtLink>
      <NuxtLink to="/concert-logs" class="card">
        <span class="card-icon">🎹</span>
        <h2>コンサート記録</h2>
        <p>実際に聴いたコンサートの記録を残す</p>
      </NuxtLink>
    </section>

    <section v-if="isAdmin" class="admin-section">
      <h2 class="admin-section-title">管理者メニュー</h2>
      <div class="admin-cards">
        <NuxtLink to="/pieces/new" class="admin-card">
          <h3>楽曲マスタ追加</h3>
          <p>新しい楽曲を登録する</p>
        </NuxtLink>
        <NuxtLink to="/composers/new" class="admin-card">
          <h3>作曲家マスタ追加</h3>
          <p>新しい作曲家を登録する</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  margin: -2rem -2rem 0;
  padding-bottom: 4rem;
  overflow-x: hidden;
}

/* ── Hero ── */
.hero {
  position: relative;
  background: linear-gradient(135deg, #0a1628 0%, #1e2d5a 60%, #152040 100%);
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 3rem 2rem;
  margin: 0;
}

/* ── アニメーション ── */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-14px);
  }
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1.3;
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.staff-lines {
  animation: shimmer 5s ease-in-out infinite;
}

.note {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: float 5s ease-in-out infinite;
}
.note-1 {
  animation-duration: 5.5s;
  animation-delay: 0s;
}
.note-2 {
  animation-duration: 4s;
  animation-delay: -1.5s;
}
.note-3 {
  animation-duration: 6.2s;
  animation-delay: -3.1s;
}
.note-4 {
  animation-duration: 4.7s;
  animation-delay: -2.2s;
}
.note-5 {
  animation-duration: 3.8s;
  animation-delay: -0.8s;
}

.hero-deco {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: fadeUp 0.9s ease-out forwards;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  color: #fff;
  font-style: italic;
  letter-spacing: 0.12em;
  margin-bottom: 1rem;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.4);
}

.hero-sub {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.06em;
  margin-bottom: 2.5rem;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #fff;
  color: var(--color-primary);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}

.cta-primary:hover {
  opacity: 0.88;
}

.cta-ghost {
  display: inline-block;
  padding: 0.75rem 2rem;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.85);
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.95rem;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.cta-ghost:hover {
  border-color: var(--color-on-primary);
  color: var(--color-on-primary);
}

/* ── Featured ── */
.featured-section {
  max-width: 760px;
  margin: 3rem auto 0;
  padding: 0 2rem;
}

/* ── Menu cards ── */
.menu-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 960px;
  margin: 2rem auto 0;
  padding: 0 2rem;
}

@media (max-width: 900px) {
  .menu-cards {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
}

.card {
  display: block;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-secondary);
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
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.card h2 {
  font-size: 1.25rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.card p {
  color: var(--color-text-faint);
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .home {
    margin: -1rem -1rem 0;
  }

  .hero {
    min-height: 300px;
  }
}

/* ── Admin section ── */
.admin-section {
  max-width: 960px;
  margin: 2rem auto 0;
  padding: 0 2rem;
}

.admin-section-title {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.admin-cards {
  display: flex;
  gap: 1rem;
}

.admin-card {
  display: block;
  background: #f5f0fa;
  border: 1px solid #c4a8e0;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.admin-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.admin-card h3 {
  font-size: 1rem;
  color: #5a3a8a;
  margin-bottom: 0.25rem;
}

.admin-card p {
  color: var(--color-text-faint);
  font-size: 0.85rem;
}

/* ── Dark mode overrides for purple-themed admin cards ── */
:global(.dark .admin-card) {
  background: #2a1f3a;
  border-color: #6e4ea8;
}

:global(.dark .admin-card h3) {
  color: #c4a8e0;
}
</style>
