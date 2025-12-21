<template>
  <mdui-button-icon
    :icon="isDark ? 'light_mode--outlined' : 'dark_mode--outlined'"
    @click="toggleTheme"
  ></mdui-button-icon>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  const html = document.documentElement
  
  if (html.classList.contains('mdui-theme-dark')) {
    // 當前是深色模式，切換到亮色
    html.classList.remove('mdui-theme-dark')
    html.classList.add('mdui-theme-light')
    isDark.value = false
    localStorage.setItem('theme', 'light')
  } else {
    // 當前是亮色模式，切換到深色
    html.classList.remove('mdui-theme-light')
    html.classList.add('mdui-theme-dark')
    isDark.value = true
    localStorage.setItem('theme', 'dark')
  }
}

onMounted(() => {
  // 檢查保存的主題偏好或用戶系統設置
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.remove('mdui-theme-auto')
    document.documentElement.classList.add('mdui-theme-dark')
    isDark.value = true
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('mdui-theme-auto')
    document.documentElement.classList.add('mdui-theme-light')
    isDark.value = false
  }
})
</script>