import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'mdui/mdui.css';

const app = createApp(App)

app.use(router)

app.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered: ', registration);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
