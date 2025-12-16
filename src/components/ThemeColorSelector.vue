<template>
  <mdui-dropdown>
    <mdui-button-icon 
      icon="color_lens"
      slot="trigger"
      class="theme-color-btn"
    ></mdui-button-icon>
    
    <mdui-menu>
      <mdui-menu-item @click="setThemeColor('default')">
        <div class="color-option">
          <div class="color-dot" style="background-color: #6750A4;"></div>
          <span>默認紫色</span>
        </div>
      </mdui-menu-item>
      
      <mdui-menu-item @click="setThemeColor('blue')">
        <div class="color-option">
          <div class="color-dot" style="background-color: #1E68D3;"></div>
          <span>海洋藍</span>
        </div>
      </mdui-menu-item>
      
      <mdui-menu-item @click="setThemeColor('green')">
        <div class="color-option">
          <div class="color-dot" style="background-color: #1E7E3E;"></div>
          <span>自然綠</span>
        </div>
      </mdui-menu-item>
      
      <mdui-menu-item @click="setThemeColor('orange')">
        <div class="color-option">
          <div class="color-dot" style="background-color: #BF5A2A;"></div>
          <span>活力橙</span>
        </div>
      </mdui-menu-item>
      
      <mdui-menu-item @click="setThemeColor('red')">
        <div class="color-option">
          <div class="color-dot" style="background-color: #B32D2D;"></div>
          <span>熱情紅</span>
        </div>
      </mdui-menu-item>
    </mdui-menu>
  </mdui-dropdown>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import 'mdui/components/button-icon.js'
import 'mdui/components/dropdown.js'
import 'mdui/components/menu.js'
import 'mdui/components/menu-item.js'

const currentTheme = ref('default')

const themeColors = {
  default: {
    light: {
      primary: '103, 80, 164',
      onPrimary: '255, 255, 255',
      primaryContainer: '234, 221, 255',
      onPrimaryContainer: '33, 0, 93'
    },
    dark: {
      primary: '208, 188, 255',
      onPrimary: '33, 0, 93',
      primaryContainer: '33, 0, 93',
      onPrimaryContainer: '234, 221, 255'
    }
  },
  blue: {
    light: {
      primary: '30, 104, 211',
      onPrimary: '255, 255, 255',
      primaryContainer: '210, 228, 255',
      onPrimaryContainer: '0, 27, 61'
    },
    dark: {
      primary: '170, 199, 255',
      onPrimary: '0, 27, 61',
      primaryContainer: '0, 45, 99',
      onPrimaryContainer: '210, 228, 255'
    }
  },
  green: {
    light: {
      primary: '30, 126, 62',
      onPrimary: '255, 255, 255',
      primaryContainer: '200, 247, 213',
      onPrimaryContainer: '0, 33, 16'
    },
    dark: {
      primary: '130, 213, 153',
      onPrimary: '0, 33, 16',
      primaryContainer: '0, 98, 47',
      onPrimaryContainer: '200, 247, 213'
    }
  },
  orange: {
    light: {
      primary: '191, 90, 42',
      onPrimary: '255, 255, 255',
      primaryContainer: '255, 220, 206',
      onPrimaryContainer: '61, 20, 0'
    },
    dark: {
      primary: '255, 182, 143',
      onPrimary: '61, 20, 0',
      primaryContainer: '147, 65, 14',
      onPrimaryContainer: '255, 220, 206'
    }
  },
  red: {
    light: {
      primary: '179, 45, 45',
      onPrimary: '255, 255, 255',
      primaryContainer: '255, 218, 214',
      onPrimaryContainer: '65, 0, 8'
    },
    dark: {
      primary: '255, 180, 171',
      onPrimary: '65, 0, 8',
      primaryContainer: '147, 0, 18',
      onPrimaryContainer: '255, 218, 214'
    }
  }
}

function setThemeColor(colorName: string) {
  currentTheme.value = colorName
  applyThemeColor()
  localStorage.setItem('theme-color', colorName)
}

function applyThemeColor() {
  const theme = themeColors[currentTheme.value as keyof typeof themeColors]
  const root = document.documentElement
  
  // 获取当前是亮色还是暗色模式
  const isDark = root.classList.contains('mdui-theme-dark')
  const mode = isDark ? 'dark' : 'light'
  const colors = theme[mode as keyof typeof theme]
  
  // 应用主题色彩
  root.style.setProperty('--md-sys-color-primary', `rgb(${colors.primary})`)
  root.style.setProperty('--md-sys-color-on-primary', `rgb(${colors.onPrimary})`)
  root.style.setProperty('--md-sys-color-primary-container', `rgb(${colors.primaryContainer})`)
  root.style.setProperty('--md-sys-color-on-primary-container', `rgb(${colors.onPrimaryContainer})`)
  
  // 设置MDUI组件使用的CSS变量
  root.style.setProperty('--mdui-color-primary-light', colors.primary)
  root.style.setProperty('--mdui-color-on-primary-light', colors.onPrimary)
  root.style.setProperty('--mdui-color-primary-container-light', colors.primaryContainer)
  root.style.setProperty('--mdui-color-on-primary-container-light', colors.onPrimaryContainer)
}

function handleDarkModeChange() {
  applyThemeColor()
}

onMounted(() => {
  // 恢复用户偏好
  const savedColor = localStorage.getItem('theme-color')
  
  if (savedColor) {
    currentTheme.value = savedColor
  }
  
  applyThemeColor()
  
  // 监听暗色模式变化
  const observer = new MutationObserver(handleDarkModeChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  
  // 清理函数
  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<style scoped>
.theme-color-btn {
  --mdui-button-icon-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.theme-color-btn:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 10%, transparent);
}

.color-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
}

color-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1px solid var(--md-sys-color-outline);
}

mdui-menu-item {
  min-width: 160px;
}
</style>