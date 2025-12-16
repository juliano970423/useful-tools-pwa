<template>
  <mdui-button-icon 
    :icon="isDark ? 'light_mode' : 'dark_mode'"
    @click="toggleDarkMode"
    class="dark-mode-toggle-btn"
  ></mdui-button-icon>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'mdui/components/button-icon.js'

const isDark = ref(false)

function toggleDarkMode() {
  isDark.value = !isDark.value
  applyDarkMode()
  localStorage.setItem('dark-mode-preference', isDark.value ? 'dark' : 'light')
}

function applyDarkMode() {
  const html = document.documentElement
  
  if (isDark.value) {
    // 使用MDUI的暗色模式类
    html.classList.add('mdui-theme-dark')
    html.classList.remove('mdui-theme-light')
  } else {
    // 使用MDUI的亮色模式类
    html.classList.add('mdui-theme-light')
    html.classList.remove('mdui-theme-dark')
  }
}

onMounted(() => {
  // 恢复用户偏好
  const savedDarkMode = localStorage.getItem('dark-mode-preference')
  
  if (savedDarkMode) {
    isDark.value = savedDarkMode === 'dark'
  } else {
    // 检测系统偏好
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  applyDarkMode()
})
</script>

<style scoped>
.dark-mode-toggle-btn {
  --mdui-button-icon-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.dark-mode-toggle-btn:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 10%, transparent);
}
</style>