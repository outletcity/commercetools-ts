const express = require('express');
const path = require('path');
const { fetchProductBySku } = require('./dist/services/fetchProductBySkuService.js');


const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the Vue app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint to fetch product by SKU
app.get('/api/product', async (req, res) => {
  try {
    const sku = req.query.sku;
    
    if (!sku) {
      return res.status(400).json({ error: 'SKU parameter is required' });
    }
    
    console.log(`API request received for SKU: ${sku}`);
    
    const product = await fetchProductBySku(sku);
    
    if (!product) {
      return res.status(404).json({ error: `No product found with SKU: ${sku}` });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error in API endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});