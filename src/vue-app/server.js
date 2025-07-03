const express = require('express');
const path = require('path');

// Enable TypeScript support
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    moduleResolution: 'node'
  }
});

// Now require the TypeScript files directly (corrected path)
const { fetchProductBySku, fetchAllPublishedProducts } = require('../fetchProductBySkuService.ts');

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

// API endpoint to fetch all published products
app.get('/api/products', async (req, res) => {
  try {
    console.log('API request received for all published products');

    const products = await fetchAllPublishedProducts();

    res.json(products);
  } catch (error) {
    console.error('Error in API endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to fetch all categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('API request received for all categories');

    const { CategoryService } = require('../category_service.ts');
    const categoryService = new CategoryService();

    const categories = await categoryService.getAllCategories();

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to fetch products by category
app.get('/api/products/category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID parameter is required' });
    }

    console.log(`API request received for products in category: ${categoryId}`);

    const { ProductService } = require('../product-service.ts');
    // You'll need to provide a valid product type ID here
    const productService = new ProductService("3e3f5ac3-6cb4-4b93-a259-82422706df61");

    const products = await productService.getProductsByCategory(categoryId);

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to fetch products by category key (alternative)
app.get('/api/products/category-key/:categoryKey', async (req, res) => {
  try {
    const categoryKey = req.params.categoryKey;

    if (!categoryKey) {
      return res.status(400).json({ error: 'Category key parameter is required' });
    }

    console.log(`API request received for products in category key: ${categoryKey}`);

    const { CategoryService } = require('../category_service.ts');
    const { ProductService } = require('../product-service.ts');

    const categoryService = new CategoryService();
    const productService = new ProductService("3e3f5ac3-6cb4-4b93-a259-82422706df61");

    // First get the category by key to get its ID
    const category = await categoryService.getCategoryByKey(categoryKey);

    if (!category) {
      return res.status(404).json({ error: `No category found with key: ${categoryKey}` });
    }

    // Then get products in that category
    const products = await productService.getProductsByCategory(category.id);

    res.json({
      category: category,
      products: products
    });
  } catch (error) {
    console.error('Error fetching products by category key:', error);
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