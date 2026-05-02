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
    <!-- ============================================================
         I. Editorial — Manifest hero
         ============================================================ -->
    <section class="hero">
      <div class="hero-rail" aria-hidden="true">
        <span class="rail-mark">
          <span class="rail-no">N&deg;</span>
          <span class="rail-num">01</span>
        </span>
        <span class="rail-line" />
        <span class="rail-foot">&mdash;</span>
      </div>

      <div class="hero-grid">
        <div class="hero-eyebrow">
          <span class="smallcaps eyebrow-tag">Editorial</span>
          <span class="eyebrow-rule" aria-hidden="true" />
          <span class="smallcaps eyebrow-meta">A Field Guide to Listening</span>
        </div>

        <h1 class="hero-title">
          <span class="hero-line-1">The art of</span>
          <span class="hero-line-2">listening,</span>
          <span class="hero-line-3"><em>kept.</em></span>
        </h1>

        <p class="hero-lede">
          一夜の演奏は、再現できない。<br />
          だからこそ、<em>聴いた瞬間</em>を書き留めておきたい。&mdash;&mdash;
          <span class="lede-quiet"
            >Nocturne は、CD・配信・コンサートで出会った音楽を静かに記録するための場所です。</span
          >
        </p>

        <div class="hero-cta">
          <NuxtLink to="/listening-logs" class="cta-primary">
            <span class="cta-label">鑑賞記録を残す</span>
            <span class="cta-arrow" aria-hidden="true">&rarr;</span>
          </NuxtLink>
          <NuxtLink to="/pieces" class="cta-ghost">
            <span class="cta-label">楽曲を探す</span>
          </NuxtLink>
        </div>
      </div>

      <!-- 五線譜 + ゴールド音符 -->
      <svg
        class="hero-deco"
        viewBox="0 0 600 320"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0" />
            <stop offset="50%" stop-color="var(--color-accent)" stop-opacity="0.85" />
            <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0" />
          </linearGradient>
        </defs>

        <g class="staff-lines" stroke="var(--staff-color)" stroke-width="0.8" fill="none">
          <line x1="0" y1="120" x2="600" y2="120" />
          <line x1="0" y1="140" x2="600" y2="140" />
          <line x1="0" y1="160" x2="600" y2="160" />
          <line x1="0" y1="180" x2="600" y2="180" />
          <line x1="0" y1="200" x2="600" y2="200" />
        </g>

        <!-- 主旋律: B4 → C#5 → D5,E5 → F#5 → G5（ロ短調 上行） -->
        <g class="note note-1" fill="var(--note-color-strong)">
          <ellipse cx="58" cy="160" rx="13" ry="9" transform="rotate(-20 58 160)" />
          <rect x="70" y="106" width="2.5" height="54" />
        </g>
        <g class="note note-2" fill="var(--note-color)">
          <g stroke="var(--note-color)" stroke-width="1.2" stroke-linecap="round" fill="none">
            <line x1="139" y1="143" x2="137" y2="157" />
            <line x1="145" y1="143" x2="143" y2="157" />
            <line x1="135" y1="147" x2="149" y2="145" />
            <line x1="135" y1="153" x2="149" y2="151" />
          </g>
          <ellipse cx="163" cy="150" rx="13" ry="9" transform="rotate(-20 163 150)" />
          <rect x="150" y="150" width="2.5" height="62" />
        </g>
        <g class="note note-3" fill="var(--note-color-soft)">
          <ellipse cx="252" cy="140" rx="13" ry="9" transform="rotate(-20 252 140)" />
          <rect x="239" y="140" width="2.5" height="62" />
          <ellipse cx="308" cy="130" rx="13" ry="9" transform="rotate(-20 308 130)" />
          <rect x="295" y="130" width="2.5" height="62" />
          <path d="M239,202 L297.5,192 L297.5,186 L239,196 Z" />
        </g>
        <g class="note note-4" fill="var(--note-color-strong)">
          <g
            stroke="var(--note-color-strong)"
            stroke-width="1.2"
            stroke-linecap="round"
            fill="none"
          >
            <line x1="390" y1="113" x2="388" y2="127" />
            <line x1="396" y1="113" x2="394" y2="127" />
            <line x1="386" y1="117" x2="400" y2="115" />
            <line x1="386" y1="123" x2="400" y2="121" />
          </g>
          <ellipse cx="414" cy="120" rx="13" ry="9" transform="rotate(-20 414 120)" />
          <rect x="401" y="120" width="2.5" height="62" />
        </g>
        <g class="note note-5" fill="var(--note-color-soft)">
          <ellipse cx="508" cy="110" rx="13" ry="9" transform="rotate(-20 508 110)" />
          <rect x="495" y="110" width="2.5" height="62" />
        </g>
      </svg>

      <!-- 装飾的な数字: 大きな I -->
      <span class="hero-bignum" aria-hidden="true">I</span>
    </section>

    <!-- ============================================================
         II. Featured — Today's piece
         ============================================================ -->
    <section class="featured-section">
      <header class="section-head">
        <span class="section-num">II</span>
        <span class="section-rule" aria-hidden="true" />
        <h2 class="section-title">Tonight&rsquo;s Selection</h2>
        <span class="section-meta smallcaps">今日の一曲</span>
      </header>

      <div class="featured-stage">
        <FeaturedPiece
          :pieces="pieces"
          :loading="loading"
          :composer-name-by-id="composerNameById"
        />
      </div>
    </section>

    <!-- ============================================================
         III. Departments — three columns
         ============================================================ -->
    <section class="departments">
      <header class="section-head">
        <span class="section-num">III</span>
        <span class="section-rule" aria-hidden="true" />
        <h2 class="section-title">Departments</h2>
        <span class="section-meta smallcaps">部門</span>
      </header>

      <div class="dept-grid stagger-children">
        <NuxtLink to="/listening-logs" class="dept-card">
          <span class="dept-num smallcaps">01 / Logs</span>
          <h3 class="dept-title">鑑賞記録</h3>
          <p class="dept-lead">
            <em>Recordings</em> — CD・配信・YouTube などで聴いた演奏の所感を、<br class="dept-br" />
            手稿のように書き留める。
          </p>
          <span class="dept-cta smallcaps">Enter &nbsp;&rarr;</span>
        </NuxtLink>

        <NuxtLink to="/pieces" class="dept-card dept-card--feature">
          <span class="dept-num smallcaps">02 / Pieces</span>
          <h3 class="dept-title">楽曲</h3>
          <p class="dept-lead">
            <em>Repertoire</em> — 交響曲、協奏曲、室内楽。<br class="dept-br" />
            登録された楽曲群を時代と編成で巡る。
          </p>
          <span class="dept-cta smallcaps">Enter &nbsp;&rarr;</span>
        </NuxtLink>

        <NuxtLink to="/concert-logs" class="dept-card">
          <span class="dept-num smallcaps">03 / Halls</span>
          <h3 class="dept-title">演奏会</h3>
          <p class="dept-lead">
            <em>Concerts</em> — 会場で聴いた音は、いずれ記憶から薄れる。<br class="dept-br" />
            消える前に、書き留める。
          </p>
          <span class="dept-cta smallcaps">Enter &nbsp;&rarr;</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============================================================
         IV. Editorial desk (Admin)
         ============================================================ -->
    <section v-if="isAdmin" class="editorial-desk">
      <header class="section-head">
        <span class="section-num">IV</span>
        <span class="section-rule" aria-hidden="true" />
        <h2 class="section-title">Editorial Desk</h2>
        <span class="section-meta smallcaps">編集部・管理者専用</span>
      </header>

      <div class="desk-grid">
        <NuxtLink to="/pieces/new" class="desk-card">
          <span class="desk-tag smallcaps">New entry</span>
          <h3 class="desk-title">楽曲を登録する</h3>
          <p class="desk-lead">レパートリーへ新しい一曲を加える。</p>
        </NuxtLink>
        <NuxtLink to="/composers/new" class="desk-card">
          <span class="desk-tag smallcaps">New entry</span>
          <h3 class="desk-title">作曲家を登録する</h3>
          <p class="desk-lead">マスタへ作曲家を追加する。</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ============================================================
 * Color helpers (五線譜SVGで使用)
 * ============================================================ */
.home {
  --staff-color: rgba(176, 138, 62, 0.28);
  --note-color: rgba(176, 138, 62, 0.55);
  --note-color-strong: rgba(176, 138, 62, 0.75);
  --note-color-soft: rgba(176, 138, 62, 0.4);

  margin: -2.5rem -2.5rem 0;
  padding-bottom: 4rem;
  overflow-x: hidden;
}
:root.dark .home {
  --staff-color: rgba(212, 173, 92, 0.32);
  --note-color: rgba(212, 173, 92, 0.6);
  --note-color-strong: rgba(212, 173, 92, 0.8);
  --note-color-soft: rgba(212, 173, 92, 0.45);
}

/* ============================================================
 * Animations
 * ============================================================ */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1.1;
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes inkSpread {
  from {
    opacity: 0;
    letter-spacing: 0.1em;
  }
  to {
    opacity: 1;
    letter-spacing: var(--tracking-tight);
  }
}

/* ============================================================
 * I. Hero
 * ============================================================ */
.hero {
  position: relative;
  background-color: var(--color-bg-paper);
  border-bottom: 1px solid var(--color-hairline);
  padding: clamp(3rem, 7vw, 6rem) clamp(1.5rem, 5vw, 6rem) clamp(4rem, 9vw, 7rem);
  overflow: hidden;
  isolation: isolate;
}

/* 紙の生成り感のレイヤー */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 25% 30%, rgba(176, 138, 62, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 90% 80%, rgba(110, 31, 43, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

:root.dark .hero {
  background: linear-gradient(180deg, #060a18 0%, #0a1226 60%, #060a18 100%);
}
:root.dark .hero::before {
  background:
    radial-gradient(ellipse at 25% 30%, rgba(212, 173, 92, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 90% 80%, rgba(184, 89, 104, 0.08) 0%, transparent 50%);
}

/* 左の縦ライン (rail) — 雑誌の余白の表情 */
.hero-rail {
  position: absolute;
  left: clamp(1.5rem, 4vw, 4rem);
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1.5rem 0;
  z-index: 2;
  font-family: var(--font-sans);
}

.rail-mark {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-accent);
  letter-spacing: 0;
}

.rail-no {
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

.rail-num {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  font-variation-settings:
    "opsz" 144,
    "WONK" 1;
}

.rail-line {
  flex: 1;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--color-hairline-strong) 30%,
    var(--color-hairline-strong) 70%,
    transparent 100%
  );
}

.rail-foot {
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: 1rem;
}

/* 大きな装飾的ローマ数字 */
.hero-bignum {
  position: absolute;
  right: clamp(1.5rem, 5vw, 5rem);
  bottom: clamp(-3rem, -3vw, -1.5rem);
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(14rem, 32vw, 30rem);
  line-height: 0.82;
  color: var(--color-accent);
  opacity: 0.18;
  z-index: 1;
  pointer-events: none;
  font-variation-settings:
    "opsz" 144,
    "WONK" 1;
  user-select: none;
}
:root.dark .hero-bignum {
  opacity: 0.22;
}

.hero-grid {
  position: relative;
  z-index: 3;
  max-width: 980px;
  margin: 0 auto 0 max(4rem, 9vw);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeUp 0.9s cubic-bezier(0.2, 0.6, 0.2, 1) forwards;
}

/* Eyebrow — Editorial / 罫線 / Field Guide */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.eyebrow-tag {
  color: var(--color-bordeaux);
  font-weight: 700;
}
:root.dark .eyebrow-tag {
  color: var(--color-bordeaux);
  filter: brightness(1.4);
}

.eyebrow-rule {
  width: 3.5rem;
  height: 1px;
  background: var(--color-hairline-strong);
}

.eyebrow-meta {
  font-family: var(--font-serif);
  font-style: italic;
  text-transform: none;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 400;
}

/* Hero Title */
.hero-title {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(3rem, 9vw, 7.5rem);
  line-height: 0.92;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 30;
}

:root.dark .hero-title {
  color: var(--color-header-text);
}

.hero-line-1,
.hero-line-2,
.hero-line-3 {
  display: block;
  animation: fadeUp 1s cubic-bezier(0.2, 0.6, 0.2, 1) backwards;
}
.hero-line-1 {
  font-style: italic;
  color: var(--color-text-muted);
  font-size: 0.55em;
  margin-left: 0.2em;
  animation-delay: 0.05s;
}
.hero-line-2 {
  margin-left: 0;
  animation-delay: 0.15s;
}
.hero-line-3 {
  margin-left: 1.4em;
  color: var(--color-accent);
  animation-delay: 0.3s;
}
.hero-line-3 em {
  font-variation-settings:
    "opsz" 144,
    "SOFT" 100,
    "WONK" 1;
}

.hero-lede {
  font-family: var(--font-serif);
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  line-height: 1.65;
  color: var(--color-text-secondary);
  max-width: 36em;
  margin-top: 0.5rem;
  font-weight: 400;
}

.hero-lede em {
  font-style: italic;
  color: var(--color-bordeaux);
}
:root.dark .hero-lede em {
  color: var(--color-accent);
}

.lede-quiet {
  color: var(--color-text-muted);
  font-size: 0.9em;
}

.hero-cta {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.cta-primary,
.cta-ghost {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.95rem 1.6rem;
  transition:
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    transform 0.3s ease;
}

.cta-primary {
  background: var(--color-bg-ink);
  color: var(--color-bg-paper);
  border: 1px solid var(--color-bg-ink);
}

.cta-primary:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-ink);
}

.cta-primary .cta-arrow {
  transition: transform 0.3s ease;
}

.cta-primary:hover .cta-arrow {
  transform: translateX(4px);
}

.cta-ghost {
  color: var(--color-text);
  border-bottom: 1px solid var(--color-hairline-strong);
  padding: 0.6rem 0;
  letter-spacing: var(--tracking-wide);
}

.cta-ghost:hover {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

:root.dark .cta-ghost {
  color: var(--color-header-text);
}

/* 五線譜SVG */
.hero-deco {
  position: absolute;
  right: -8%;
  top: 50%;
  transform: translateY(-50%);
  width: 75%;
  height: 70%;
  pointer-events: none;
  opacity: 0.7;
  z-index: 1;
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

/* ============================================================
 * Section head — 雑誌の章タイトル
 * ============================================================ */
.section-head {
  display: flex;
  align-items: baseline;
  gap: 1.4rem;
  margin-bottom: 2.2rem;
  padding-top: 0.5rem;
}

.section-num {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 1.4rem;
  color: var(--color-accent);
  letter-spacing: 0.05em;
}

.section-rule {
  flex: 0 0 4rem;
  height: 1px;
  align-self: center;
  background: var(--color-hairline-strong);
}

.section-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings: "opsz" 80;
}

.section-meta {
  margin-left: auto;
  color: var(--color-text-faint);
}

/* ============================================================
 * II. Featured stage
 * ============================================================ */
.featured-section {
  max-width: 1080px;
  margin: clamp(3rem, 6vw, 5rem) auto 0;
  padding: 0 clamp(1.5rem, 5vw, 4rem);
}

.featured-stage {
  border: 1px solid var(--color-hairline);
  background: var(--color-bg-surface);
  padding: clamp(1.25rem, 3vw, 2.25rem);
  position: relative;
}

/* 4隅の装飾的なゴールドコーナー */
.featured-stage::before,
.featured-stage::after {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1px solid var(--color-accent);
  pointer-events: none;
}
.featured-stage::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}
.featured-stage::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}

/* ============================================================
 * III. Departments
 * ============================================================ */
.departments {
  max-width: 1280px;
  margin: clamp(4rem, 7vw, 6rem) auto 0;
  padding: 0 clamp(1.5rem, 5vw, 4rem);
}

.dept-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-top: 1px solid var(--color-hairline-strong);
}

.dept-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 2.4rem 1.8rem 2.2rem;
  text-decoration: none;
  color: inherit;
  transition: background 0.3s ease;
  border-right: 1px solid var(--color-hairline);
  background: var(--color-bg-paper);
}
.dept-card:last-child {
  border-right: none;
}

.dept-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.dept-card:hover::before {
  transform: scaleX(1);
}

.dept-card:hover {
  background: var(--color-bg-elevated);
}

.dept-card:hover .dept-cta {
  color: var(--color-accent);
  letter-spacing: calc(var(--tracking-widest) + 0.04em);
}

.dept-num {
  color: var(--color-bordeaux);
  font-weight: 600;
}
:root.dark .dept-num {
  color: var(--color-accent);
}

.dept-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.7rem, 3vw, 2.4rem);
  font-style: italic;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  line-height: 1.05;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 60;
}

.dept-lead {
  font-family: var(--font-serif);
  font-size: 1rem;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.dept-lead em {
  font-style: italic;
  color: var(--color-bordeaux);
  font-weight: 500;
  margin-right: 0.25em;
}
:root.dark .dept-lead em {
  color: var(--color-accent);
}

.dept-cta {
  margin-top: 0.6rem;
  color: var(--color-text-muted);
  transition:
    color 0.25s ease,
    letter-spacing 0.25s ease;
}

.dept-card--feature {
  background: var(--color-bg-surface);
}
.dept-card--feature .dept-title {
  color: var(--color-text);
}

/* ============================================================
 * IV. Editorial desk (admin)
 * ============================================================ */
.editorial-desk {
  max-width: 1280px;
  margin: clamp(3rem, 6vw, 5rem) auto 0;
  padding: 0 clamp(1.5rem, 5vw, 4rem);
}

.desk-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: var(--color-hairline);
  border: 1px solid var(--color-hairline);
}

.desk-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.8rem 1.6rem;
  background: var(--color-bg-paper);
  text-decoration: none;
  color: inherit;
  transition: background 0.3s ease;
  position: relative;
}

.desk-card:hover {
  background: var(--color-accent-bg);
}

.desk-tag {
  color: var(--color-bordeaux);
}
:root.dark .desk-tag {
  color: var(--color-accent);
}

.desk-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.4rem;
  font-style: italic;
  color: var(--color-text);
}

.desk-lead {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

/* ============================================================
 * Responsive
 * ============================================================ */
@media (max-width: 980px) {
  .hero-rail {
    display: none;
  }
  .hero-grid {
    margin-left: 0;
  }
  .hero-deco {
    width: 100%;
    right: -10%;
    opacity: 0.45;
  }
  .dept-grid {
    grid-template-columns: 1fr;
  }
  .dept-card {
    border-right: none;
    border-bottom: 1px solid var(--color-hairline);
  }
  .dept-card:last-child {
    border-bottom: none;
  }
  .dept-br {
    display: none;
  }
}

@media (max-width: 600px) {
  .home {
    margin: -1.2rem -1.2rem 0;
  }
  .hero {
    padding: 3rem 1.5rem 4rem;
  }
  .hero-title {
    font-size: clamp(2.4rem, 11vw, 3.6rem);
  }
  .hero-line-3 {
    margin-left: 0.6em;
  }
  .section-head {
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
  }
  .section-rule {
    flex: 1;
  }
  .section-meta {
    margin-left: 0;
    width: 100%;
  }
  .desk-grid {
    grid-template-columns: 1fr;
  }
}
</style>
