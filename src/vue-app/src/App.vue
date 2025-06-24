<template>
  <div id="app">
    <header>
      <h1>Product Search</h1>
    </header>
    <main>
      <ProductSearch />
    </main>
  </div>
</template>

<script>
import ProductSearch from './components/ProductSearch.vue'

export default {
  name: 'App',
  components: {
    ProductSearch
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

header {
  margin-bottom: 30px;
}

main {
  max-width: 800px;
  margin: 0 auto;
}
</style>