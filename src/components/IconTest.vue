<template>
  <div class="icon-test">
    <h3>图标测试</h3>
    
    <div class="test-section">
      <h4>mdui-button-icon 测试</h4>
      <mdui-button-icon icon="home"></mdui-button-icon>
      <mdui-button-icon icon="search"></mdui-button-icon>
      <mdui-button-icon icon="settings"></mdui-button-icon>
    </div>
    
    <div class="test-section">
      <h4>mdui-icon 测试</h4>
      <mdui-icon name="home"></mdui-icon>
      <mdui-icon name="search"></mdui-icon>
      <mdui-icon name="settings"></mdui-icon>
    </div>
    
    <div class="test-section">
      <h4>Material Symbols 原生测试</h4>
      <span class="material-symbols-outlined">home</span>
      <span class="material-symbols-outlined">search</span>
      <span class="material-symbols-outlined">settings</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'mdui/components/button-icon.js'
import 'mdui/components/icon.js'
</script>

<style scoped>
.icon-test {
  padding: 2rem;
}

.test-section {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.test-section h4 {
  margin-bottom: 1rem;
}

mdui-button-icon, mdui-icon, .material-symbols-outlined {
  margin: 0.5rem;
  font-size: 24px;
}
</style>