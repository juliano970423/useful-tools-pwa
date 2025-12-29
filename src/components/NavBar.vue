<template>
  <header class="md3e-header">
    <div class="header-content">
      <div class="logo-section">
        <div class="logo-icon">
          <span class="material-symbols-outlined">bolt</span>
        </div>
        <h2 class="logo-text headline-small">工具中心</h2>
      </div>

      <div class="header-actions">
        <mdui-dropdown>
          <mdui-button class="header-btn text-btn no-theme-color" variant="text" slot="trigger" end-icon="expand_more">
            <span class="btn-text label-large">工具</span>
          </mdui-button>
          <mdui-menu>
            <router-link to="/calculator" style="text-decoration: none; color: inherit;">
              <mdui-menu-item>計算機</mdui-menu-item>
            </router-link>
            <router-link to="/focus-training" style="text-decoration: none; color: inherit;">
              <mdui-menu-item>專注力訓練</mdui-menu-item>
            </router-link>
            <router-link to="/english-training" style="text-decoration: none; color: inherit;">
              <mdui-menu-item>英語訓練</mdui-menu-item>
            </router-link>
          </mdui-menu>
        </mdui-dropdown>
        <mdui-button-icon
          icon="code"
          @click="openGitHub"
          class="header-btn"
        ></mdui-button-icon>
        <DarkModeToggle />
        <ThemeColorSelector />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import 'mdui/components/button.js';
import 'mdui/components/button-icon.js';
import 'mdui/components/dropdown.js';
import 'mdui/components/menu.js';
import 'mdui/components/menu-item.js';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import DarkModeToggle from './DarkModeToggle.vue';
import ThemeColorSelector from './ThemeColorSelector.vue';

const openGitHub = () => {
  window.open('https://github.com/juliano970423/useful-tools-pwa', '_blank');
};
</script>

<style scoped>
/* 使用MDUI原生變量，不移除原有結構 */
.md3e-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  border-bottom: 1px solid var(--mdui-color-outline-variant);
  padding: 0.75rem 2.5rem;
  height: 4rem;
  background-color: var(--mdui-color-surface);
  color: var(--mdui-color-on-surface);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-section > *:not(:first-child) {
  margin-left: 1rem;
}

.logo-icon {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon .material-symbols-outlined {
  font-size: 1.5rem;
  color: var(--mdui-color-on-surface);
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.5rem;
  letter-spacing: -0.015em;
  margin: 0;
  color: var(--mdui-color-on-surface);
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.header-actions > *:not(:first-child) {
  margin-left: 0.5rem;
}

.header-btn {
  height: 2.5rem;
  min-height: 2.5rem;
  width: auto;
}

.btn-text {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.no-theme-color {
  --mdui-button-color: var(--mdui-color-on-surface);
  --mdui-button-color-hover: var(--mdui-color-on-surface-variant);
  --mdui-button-color-focus: var(--mdui-color-on-surface-variant);
  --mdui-button-color-pressed: var(--mdui-color-on-surface-variant);
  color: var(--mdui-color-on-surface) !important;
}

/* 響應式設計保持原樣 */
@media (max-width: 1024px) {
  .md3e-header {
    padding: 0.75rem 2rem;
  }
}

@media (max-width: 768px) {
  .md3e-header {
    padding: 0.75rem 1.5rem;
  }

  .header-actions > *:not(:first-child) {
    margin-left: 0.25rem;
  }
}

@media (max-width: 480px) {
  .md3e-header {
    padding: 0.5rem 1rem;
  }

  .header-content {
    flex-direction: column;
  }

  .header-content > *:not(:first-child) {
    margin-top: 0.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-around;
  }
}
</style>