<template>
  <div class="md3e-root">
    <NavBar />

    <main class="md3e-main">
      <div class="layout-container">
        <div class="hero-section">
          <div class="hero-content">
            <div class="carousel-container">
              <img
                v-for="(image, index) in images"
                :key="index"
                :src="image"
                v-show="currentIndex === index"
                class="carousel-image"
                alt="Hero Image"
              />
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
  '/public/images/Elysia.png',
  '/public/images/Elysia1.webp',
  '/public/images/Seele.png'
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

.md3e-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--md3-surface);
  color: var(--md3-on-surface);
  font-family: "Roboto", "Segoe UI", sans-serif;
}

.md3e-main {
  flex: 1;
  padding: 1.25rem 6.25rem; /* px-40 equivalent */
  display: flex;
  justify-content: center; /* Center content horizontally */
}

.layout-container {
  max-width: 60rem; /* max-w-[960px] */
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
  height: 70vh; /* Make the image take 70% of viewport height */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  background-color: var(--md3-surface);
  border-radius: 0.75rem; /* rounded-xl */
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 70vh; /* Make the carousel take 70% of viewport height */
  overflow: hidden;
  border-radius: 0.75rem; /* rounded-xl */
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.5s ease-in-out;
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
