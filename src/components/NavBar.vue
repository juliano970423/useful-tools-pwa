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
          <mdui-button class="header-btn text-btn" variant="text" slot="trigger" end-icon="expand_more">
            <span class="btn-text label-large">工具</span>
          </mdui-button>
          <mdui-menu>
            <router-link to="/calculator" style="text-decoration: none; color: inherit;">
              <mdui-menu-item>計算機</mdui-menu-item>
            </router-link>
            <router-link to="/focus-training" style="text-decoration: none; color: inherit;">
              <mdui-menu-item>專注力訓練</mdui-menu-item>
            </router-link>
            <mdui-menu-item>工具 3</mdui-menu-item>
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
/* Material Design 3 Expressive Color Scheme */
:root {
  --md3-primary: #6750A4;
  --md3-on-primary: #FFFFFF;
  --md3-primary-container: #EADDFF;
  --md3-on-primary-container: #21005D;
  --md3-secondary: #625B71;
  --md3-on-secondary: #FFFFFF;
  --md3-secondary-container: #E8DEF8;
  --md3-on-secondary-container: #1D192B;
  --md3-tertiary: #7D5260;
  --md3-on-tertiary: #FFFFFF;
  --md3-tertiary-container: #FFD8E4;
  --md3-on-tertiary-container: #31111D;
  --md3-surface: #FFFBFE;
  --md3-on-surface: #1C1B1F;
  --md3-surface-variant: #E7E0EC;
  --md3-on-surface-variant: #49454F;
  --md3-outline: #79747E;
  --md3-outline-variant: #CAC4D0;
  --md3-shadow: #000000;
  --md3-scrim: #000000;
  --md3-error: #B3261E;
  --md3-on-error: #FFFFFF;
  --md3-error-container: #F9DEDC;
  --md3-on-error-container: #410E0B;

  /* Custom theme colors based on reference */
  --theme-primary: #6750A4;
  --theme-on-primary: #FFFFFF;
  --theme-surface: #FFFFFF;
  --theme-on-surface: #111418;
  --theme-on-surface-variant: #617589;
  --theme-outline: #f0f2f4;
}

.md3e-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  border-bottom: 1px solid var(--theme-outline);
  padding: 0.75rem 2.5rem;
  height: 4rem;
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
  gap: 1rem;
  color: var(--theme-on-surface);
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
  color: var(--theme-on-surface);
}

.logo-text {
  color: var(--theme-on-surface);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.5rem;
  letter-spacing: -0.015em;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem; /* Better spacing between buttons */
}

.header-btn {
  height: 2.5rem;
  min-height: 2.5rem; /* Ensure consistent height */
  width: auto;
  color: var(--md3-on-surface-variant);
  --md-sys-color-primary: var(--md3-on-surface-variant);
  --md-sys-color-on-surface: var(--md3-on-surface-variant);
  display: flex;
  align-items: center;
}

/* Style for text button with icon alignment */
.header-btn.text-btn::part(button) {
  width: auto;
  padding: 0; /* Set padding to 0 for most compact appearance */
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 0.125rem; /* Reduced gap between text and icon */
}

/* Style for icon buttons */
.header-btn:not(.text-btn)::part(button) {
  width: 2.5rem;
  height: 2.5rem;
  min-width: 2.5rem;
  min-height: 2.5rem; /* Ensure equal width and height for circular ripple */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1; /* Ensure proper vertical alignment */
  /* Ensure circular shape for ripple effect */
  --_shape: var(--mdui-shape-corner-full, 50%);
  border-radius: var(--_shape);
}

/* Add hover effect */
.header-btn::part(button):hover {
  background-color: color-mix(in srgb, var(--md3-on-surface-variant) 10%, transparent);
}

/* Ensure text and icon are vertically aligned */
.header-btn .btn-text {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Ensure ripple effects work properly for all buttons */
.header-btn::part(button) {
  position: relative;
  overflow: visible;
}

/* Make sure all header buttons have consistent styling */
.header-btn::part(button) {
  transition: background-color 0.2s ease;
  align-items: center;
  justify-content: center;
}

/* Ensure proper alignment for text buttons */
.header-btn.text-btn::part(button) {
  align-items: center;
  justify-content: center;
}

/* Material Design 3 Typography Scales */
.display-large {
  font-size: 3.562rem;
  line-height: 4rem;
  font-weight: 400;
  letter-spacing: -0.015625em;
}

.display-medium {
  font-size: 2.812rem;
  line-height: 3.25rem;
  font-weight: 400;
  letter-spacing: 0em;
}

.display-small {
  font-size: 2.25rem;
  line-height: 2.75rem;
  font-weight: 400;
  letter-spacing: 0em;
}

.headline-large {
  font-size: 2rem;
  line-height: 2.5rem;
  font-weight: 400;
  letter-spacing: 0em;
}

.headline-medium {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 400;
  letter-spacing: 0.0075em;
}

.headline-small {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 400;
  letter-spacing: 0.0125em;
}

.title-large {
  font-size: 1.375rem;
  line-height: 1.75rem;
  font-weight: 400;
  letter-spacing: 0.0125em;
}

.title-medium {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.0075em;
}

.title-small {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0075em;
}

.label-large {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.00625em;
}

.label-medium {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  letter-spacing: 0.03125em;
}

.label-small {
  font-size: 0.6875rem;
  line-height: 1rem;
  font-weight: 500;
  letter-spacing: 0.03125em;
}

.body-large {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.03125em;
}

.body-medium {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.015625em;
}

.body-small {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  letter-spacing: 0.025em;
}

.text-center {
  text-align: center;
}

/* Responsive design */
@media (max-width: 1024px) {
  .md3e-header {
    padding: 0.75rem 2rem;
  }
}

@media (max-width: 768px) {
  .md3e-header {
    padding: 0.75rem 1.5rem;
  }

  .header-actions {
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .md3e-header {
    padding: 0.5rem 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-around;
  }
}
</style>