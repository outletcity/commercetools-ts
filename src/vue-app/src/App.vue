
<template>
  <div id="app">
    <CategoryProductView />
  </div>
</template>

<script>
import CategoryProductView from './components/CategoryProductView.vue'

export default {
  name: 'App',
  components: {
    CategoryProductView
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