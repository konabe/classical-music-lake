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

const today = new Date();
const issueLabel = computed(() => {
  const year = today.getFullYear();
  const month = today.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return `VOL. ${roman[today.getMonth() + 1]} · ${month} · ${year}`;
});
</script>

<template>
  <div class="app">
    <header class="masthead">
      <div class="masthead-inner">
        <!-- 上段: 号数とテーマトグル -->
        <div class="masthead-top">
          <span class="issue-label smallcaps">{{ issueLabel }}</span>
          <span class="motto smallcaps">A Quarterly of Classical Listening</span>
          <div class="masthead-utils">
            <span class="lat-long smallcaps" aria-hidden="true">35°41′N · 139°41′E</span>
            <ThemeToggle />
          </div>
        </div>

        <!-- 中段: マストヘッド + ナビ -->
        <nav class="masthead-main" aria-label="Primary">
          <NuxtLink to="/" class="logo" aria-label="Nocturne">
            <span class="logo-text">Nocturne</span>
            <span class="logo-mark" aria-hidden="true">&#9839;</span>
          </NuxtLink>

          <ul class="nav-links">
            <li>
              <NuxtLink to="/listening-logs">
                <span class="nav-num smallcaps">01</span>
                <span class="nav-label">鑑賞記録</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/pieces">
                <span class="nav-num smallcaps">02</span>
                <span class="nav-label">楽曲</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/composers">
                <span class="nav-num smallcaps">03</span>
                <span class="nav-label">作曲家</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/concert-logs">
                <span class="nav-num smallcaps">04</span>
                <span class="nav-label">演奏会</span>
              </NuxtLink>
            </li>
          </ul>

          <div class="masthead-auth">
            <ul v-if="!isLoggedIn" class="auth-links">
              <li><NuxtLink to="/auth/user-register">Register</NuxtLink></li>
              <li class="sep" aria-hidden="true">·</li>
              <li><NuxtLink to="/auth/login">Sign in</NuxtLink></li>
            </ul>
            <button v-else class="logout-button" @click="logout">Sign out</button>
          </div>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="colophon">
      <div class="colophon-inner">
        <span class="smallcaps">Nocturne &mdash; for solitary listening</span>
        <span class="colophon-rule" aria-hidden="true" />
        <span class="smallcaps">Set in Fraunces &amp; Inter Tight</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ============================================================
 * Masthead — Editorial Quarterly
 * ============================================================ */
.masthead {
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
  position: relative;
}

/* 上下にゴールドのヘアライン */
.masthead::before,
.masthead::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-accent) 20%,
    var(--color-accent) 80%,
    transparent 100%
  );
  opacity: 0.45;
}
.masthead::before {
  top: 0;
}
.masthead::after {
  bottom: 0;
}

.masthead-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2.5rem;
}

/* ── 上段: 号数と日時 ── */
.masthead-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(184, 168, 136, 0.18);
  font-size: 0.68rem;
}

.issue-label,
.motto,
.lat-long {
  color: var(--color-header-text-muted);
}

.motto {
  font-family: var(--font-serif);
  font-style: italic;
  text-transform: none;
  letter-spacing: 0.04em;
  font-size: 0.78rem;
  font-weight: 400;
}

.masthead-utils {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

/* ── 中段: マストヘッド + ナビ ── */
.masthead-main {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
  padding: 1.4rem 0 1.5rem;
}

.logo {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  text-decoration: none;
  justify-self: start;
  color: var(--color-header-text);
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: 2.4rem;
  letter-spacing: -0.01em;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
  line-height: 1;
  color: var(--color-header-text);
}

.logo-mark {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-accent);
  font-weight: 300;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  justify-self: center;
}

.nav-links a {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  text-decoration: none;
  color: var(--color-header-text);
  font-family: var(--font-sans);
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  position: relative;
  padding: 0.25rem 0;
  transition: color 0.2s ease;
}

.nav-num {
  font-size: 0.6rem;
  color: var(--color-accent);
  letter-spacing: 0.2em;
  vertical-align: super;
  line-height: 1;
}

.nav-label {
  font-weight: 500;
}

.nav-links a::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -2px;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition:
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-links a:hover::after,
.nav-links a.router-link-active::after {
  left: 0;
  width: 100%;
}

.nav-links a.router-link-active {
  color: var(--color-accent-soft);
}

.masthead-auth {
  justify-self: end;
}

.auth-links {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0;
  padding: 0;
}

.auth-links a {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1rem;
  text-decoration: none;
  color: var(--color-header-text);
  transition: color 0.2s ease;
  letter-spacing: 0.02em;
}

.auth-links a:hover {
  color: var(--color-accent);
}

.auth-links .sep {
  color: var(--color-header-text-muted);
  font-family: var(--font-serif);
}

.logout-button {
  background: transparent;
  border: 1px solid var(--color-accent);
  color: var(--color-header-text);
  padding: 0.5rem 1.1rem;
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

.logout-button:hover {
  background: var(--color-accent);
  color: var(--color-bg-ink);
}

/* ============================================================
 * Main
 * ============================================================ */
.app-main {
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem;
}

/* ============================================================
 * Colophon (Footer)
 * ============================================================ */
.colophon {
  border-top: 1px solid var(--color-hairline);
  margin-top: 4rem;
  padding: 1.5rem 2.5rem;
}

.colophon-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.68rem;
}

.colophon-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

/* ============================================================
 * Responsive
 * ============================================================ */
@media (max-width: 980px) {
  .masthead-inner {
    padding: 0 1.5rem;
  }
  .masthead-top {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .motto {
    display: none;
  }
  .masthead-main {
    grid-template-columns: 1fr auto;
    gap: 1rem;
    padding: 1.1rem 0;
  }
  .logo-text {
    font-size: 1.9rem;
  }
  .nav-links {
    grid-column: 1 / -1;
    justify-self: stretch;
    justify-content: space-between;
    gap: 0.5rem;
    padding-top: 0.6rem;
    border-top: 1px solid rgba(184, 168, 136, 0.15);
  }
  .nav-links a {
    font-size: 0.8rem;
  }
  .masthead-auth {
    justify-self: end;
  }
  .lat-long {
    display: none;
  }
}

@media (max-width: 600px) {
  .masthead-inner {
    padding: 0 1rem;
  }
  .app-main {
    padding: 1.2rem;
  }
  .auth-links a {
    font-size: 0.85rem;
  }
  .colophon {
    padding: 1.2rem 1rem;
  }
  .colophon-inner {
    flex-wrap: wrap;
  }
  .colophon-rule {
    display: none;
  }
}

@media (max-width: 380px) {
  .nav-num {
    display: none;
  }
}
</style>
