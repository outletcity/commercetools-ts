
<template>
  <div id="app">
    <ProductDetail v-if="isProductDetailView" />
    <CategoryProductView v-else />
  </div>
</template>

<script>
import CategoryProductView from './components/CategoryProductView.vue'
import ProductDetail from './components/ProductDetail.vue'

export default {
  name: 'App',
  components: {
    CategoryProductView,
    ProductDetail
  },
  data() {
    return {
      isProductDetailView: false
    }
  },
  mounted() {
    // Check if we're on a product detail page
    this.checkRoute();

    // Listen for URL changes
    window.addEventListener('popstate', this.checkRoute);
  },
  beforeUnmount() {
    window.removeEventListener('popstate', this.checkRoute);
  },
  methods: {
    checkRoute() {
      // Check if the URL has a product parameter
      const urlParams = new URLSearchParams(window.location.search);
      this.isProductDetailView = urlParams.has('sku');
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}
</style>
