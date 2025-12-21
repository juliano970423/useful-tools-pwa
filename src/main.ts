import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 导入MDUI CSS和组件
import 'mdui/mdui.css';
import 'mdui';

const app = createApp(App)

app.use(router)

app.mount('#app')

// Register PWA service worker - let vite-plugin-pwa handle this
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}
