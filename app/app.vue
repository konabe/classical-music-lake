<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
}

/* スムーススクロールは reduced-motion 利用者にはオフ */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  font-family: var(--font-sans);
  font-feature-settings:
    "ss01" 1,
    "ss02" 1,
    "cv11" 1;
  font-weight: 400;
  background-color: var(--color-bg-base);
  color: var(--color-text);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  position: relative;
  min-height: 100vh;
}

/* 紙の繊維感: 縦横に走る極細のライン + 微細なノイズ */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 3px,
      rgba(19, 28, 56, 0.012) 3px,
      rgba(19, 28, 56, 0.012) 4px
    ),
    radial-gradient(circle at 20% 0%, rgba(176, 138, 62, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 100%, rgba(110, 31, 43, 0.03) 0%, transparent 50%);
}

:root.dark body::before {
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 3px,
      rgba(240, 232, 210, 0.015) 3px,
      rgba(240, 232, 210, 0.015) 4px
    ),
    radial-gradient(circle at 20% 0%, rgba(212, 173, 92, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 100%, rgba(184, 89, 104, 0.04) 0%, transparent 50%);
}

#__nuxt {
  position: relative;
  z-index: 1;
}

/* ディスプレイ・見出しの基底 */
h1,
h2,
h3 {
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  line-height: 1.1;
}

h4,
h5,
h6 {
  font-family: var(--font-sans);
  font-weight: 600;
  letter-spacing: var(--tracking-base);
  color: var(--color-text);
}

/* 数字のタブラー化（揃え用） */
.numeric,
time {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

/* スモールキャップ（雑誌風キャプション） */
.smallcaps {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--color-text-muted);
}

/* セレクションカラー */
::selection {
  background: var(--color-accent);
  color: var(--color-on-primary);
}

/* ページトランジション — フェード + 微小なリフト */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.32s cubic-bezier(0.2, 0.6, 0.2, 1),
    transform 0.32s cubic-bezier(0.2, 0.6, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* リスト stagger reveal — 子要素を順次フェード */
@keyframes stagger-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger-children > * {
  animation: stagger-up 0.6s cubic-bezier(0.2, 0.6, 0.2, 1) backwards;
}
.stagger-children > *:nth-child(1) {
  animation-delay: 0.05s;
}
.stagger-children > *:nth-child(2) {
  animation-delay: 0.1s;
}
.stagger-children > *:nth-child(3) {
  animation-delay: 0.15s;
}
.stagger-children > *:nth-child(4) {
  animation-delay: 0.2s;
}
.stagger-children > *:nth-child(5) {
  animation-delay: 0.25s;
}
.stagger-children > *:nth-child(6) {
  animation-delay: 0.3s;
}
.stagger-children > *:nth-child(7) {
  animation-delay: 0.35s;
}
.stagger-children > *:nth-child(8) {
  animation-delay: 0.4s;
}
.stagger-children > *:nth-child(9) {
  animation-delay: 0.45s;
}
.stagger-children > *:nth-child(10) {
  animation-delay: 0.5s;
}
.stagger-children > *:nth-child(n + 11) {
  animation-delay: 0.55s;
}

/* prefers-reduced-motion 対応 */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .stagger-children > * {
    animation: none !important;
    transition: none !important;
  }
  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}
</style>
