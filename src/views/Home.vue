<template>
  <div class="md3e-root">
    <NavBar />

    <main class="md3e-main">
      <div class="layout-container">
        <div class="hero-section">
          <div class="hero-content">
            <div class="carousel-container">
              <div
                v-for="(image, index) in images"
                :key="index"
                class="carousel-slide"
                :class="{ 'active': currentIndex === index }"
              >
                <img
                  :src="image"
                  class="carousel-image"
                  alt="Hero Image"
                />
              </div>
              <button @click="prevImage" class="carousel-button prev-button">❮</button>
              <button @click="nextImage" class="carousel-button next-button">❯</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

const images = ref([
  '/images/Elysia.png',
  '/images/Elysia1.webp',
  '/images/Seele.png'
])
const currentIndex = ref(0)
let carouselInterval: number | undefined

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

const startCarousel = () => {
  carouselInterval = setInterval(nextImage, 5000) // Change image every 5 seconds
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<style scoped>
/* 使用MDUI原生變量，移除所有自定義顏色 */
.md3e-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.md3e-main {
  flex: 1;
  padding: 1.25rem 6.25rem;
  display: flex;
  justify-content: center;
}

.layout-container {
  max-width: 60rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.hero-content {
  width: 100%;
  container-type: inline-size;
}

@container (min-width: 480px) {
  .hero-content {
    padding: 1rem;
  }
}

.hero-image {
  width: 100%;
  height: 70vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  border-radius: 0.75rem;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
  border-radius: 0.75rem;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 1rem;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 10;
}

.prev-button {
  left: 0;
  border-top-right-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}

.next-button {
  right: 0;
  border-top-left-radius: 0.75rem;
  border-bottom-left-radius: 0.75rem;
}

/* Responsive design */
@media (max-width: 1024px) {
  .md3e-main {
    padding: 1.25rem 2rem;
  }
}

@media (max-width: 768px) {
  .md3e-main {
    padding: 1rem 1rem;
  }
}

@media (max-width: 480px) {
  .md3e-main {
    padding: 0.5rem;
  }
}
</style>
