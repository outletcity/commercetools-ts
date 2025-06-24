module.exports = {
  // Output directory for the built files
  outputDir: 'dist',
  
  // Configure the dev server
  devServer: {
    // Proxy API requests during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
};