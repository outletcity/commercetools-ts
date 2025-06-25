<template>
  <div class="category-product-view">
    <div class="container">
      <!-- Left Sidebar - Categories -->
      <div class="sidebar">
        <h2 class="sidebar-title">Categories</h2>

        <!-- All Products Option -->
        <div
            class="category-item"
            :class="{ active: selectedCategory === null }"
            @click="selectCategory(null)"
        >
          <span class="category-name">All Products</span>
          <span class="product-count">({{ totalProductsCount }})</span>
        </div>

        <!-- Loading State -->
        <div v-if="categoriesLoading" class="loading">
          Loading categories...
        </div>

        <!-- Categories List -->
        <div v-else-if="categories.length > 0" class="categories-list">
          <div
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategory?.id === category.id }"
              @click="selectCategory(category)"
          >
            <span class="category-name">{{ getCategoryName(category) }}</span>
            <span class="product-count">({{ getCategoryProductCount(category.id) }})</span>
          </div>
        </div>

        <!-- No Categories -->
        <div v-else class="no-categories">
          No categories found
        </div>
      </div>

      <!-- Main Content - Products -->
      <div class="main-content">
        <div class="content-header">
          <h1 class="page-title">
            {{ selectedCategory ? getCategoryName(selectedCategory) : 'All Products' }}
          </h1>
          <p class="product-count-text">
            {{ filteredProducts.length }} product{{ filteredProducts.length !== 1 ? 's' : '' }} found
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="productsLoading" class="loading">
          Loading products...
        </div>

        <!-- Products Grid -->
        <div v-else-if="filteredProducts.length > 0" class="products-grid">
          <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
          >
            <div class="product-image">
              <!-- Placeholder image - replace with actual product images if available -->
              <div class="image-placeholder">
                {{ getProductInitials(product) }}
              </div>
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ getProductName(product) }}</h3>
              <p class="product-description" v-if="getProductDescription(product)">
                {{ getProductDescription(product) }}
              </p>

              <!-- Product Categories -->
              <div class="product-categories" v-if="product.categories && product.categories.length > 0">
                <span
                    v-for="categoryRef in product.categories"
                    :key="categoryRef.id"
                    class="category-tag"
                >
                  {{ getCategoryNameById(categoryRef.id) }}
                </span>
              </div>

              <!-- Product Price -->
              <div class="product-price" v-if="getProductPrice(product)">
                {{ formatPrice(getProductPrice(product)) }}
              </div>
            </div>
          </div>
        </div>

        <!-- No Products -->
        <div v-else class="no-products">
          <p>No products found{{ selectedCategory ? ` in ${getCategoryName(selectedCategory)}` : '' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryProductView',
  data() {
    return {
      categories: [],
      allProducts: [],
      filteredProducts: [],
      selectedCategory: null,
      categoriesLoading: false,
      productsLoading: false,
      categoryProductCounts: {}
    }
  },

  computed: {
    totalProductsCount() {
      return this.allProducts.length;
    }
  },

  async mounted() {
    await this.loadCategories();
    await this.loadAllProducts();
  },

  methods: {
    async loadCategories() {
      this.categoriesLoading = true;
      try {
        console.log('Fetching categories...');
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categories = await response.json();
        console.log('Categories loaded:', categories);

        this.categories = categories;

        // Load product counts for each category
        await this.loadCategoryProductCounts();
      } catch (error) {
        console.error('Error loading categories:', error);
        this.categories = [];
      } finally {
        this.categoriesLoading = false;
      }
    },

    async loadAllProducts() {
      this.productsLoading = true;
      try {
        console.log('Fetching all products...');
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        console.log('Products loaded:', products);

        this.allProducts = products;
        this.filteredProducts = products;
      } catch (error) {
        console.error('Error loading products:', error);
        this.allProducts = [];
        this.filteredProducts = [];
      } finally {
        this.productsLoading = false;
      }
    },

    async loadCategoryProductCounts() {
      // Initialize counts
      this.categoryProductCounts = {};

      // Count products for each category
      for (const category of this.categories) {
        try {
          const response = await fetch(`/api/products/category/${category.id}`);
          if (response.ok) {
            const products = await response.json();
            this.categoryProductCounts[category.id] = products.length;
          }
        } catch (error) {
          console.error(`Error loading product count for category ${category.id}:`, error);
          this.categoryProductCounts[category.id] = 0;
        }
      }
    },

    async selectCategory(category) {
      this.selectedCategory = category;
      this.productsLoading = true;

      try {
        if (category === null) {
          // Show all products
          this.filteredProducts = this.allProducts;
        } else {
          // Fetch products for the selected category
          console.log('Fetching products for category:', category.id);
          const response = await fetch(`/api/products/category/${category.id}`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const products = await response.json();
          console.log(`Products for category ${category.id}:`, products);

          this.filteredProducts = products;
        }
      } catch (error) {
        console.error('Error loading products for category:', error);
        this.filteredProducts = [];
      } finally {
        this.productsLoading = false;
      }
    },

    getCategoryName(category) {
      if (!category) return '';

      // Handle localized names
      if (category.name && typeof category.name === 'object') {
        return category.name.en || category.name[Object.keys(category.name)[0]] || 'Unnamed Category';
      }

      return category.name || 'Unnamed Category';
    },

    getCategoryNameById(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? this.getCategoryName(category) : 'Unknown Category';
    },

    getCategoryProductCount(categoryId) {
      return this.categoryProductCounts[categoryId] || 0;
    },

    getProductName(product) {
      if (!product) return '';

      // Handle localized names
      if (product.name && typeof product.name === 'object') {
        return product.name.en || product.name[Object.keys(product.name)[0]] || 'Unnamed Product';
      }

      return product.name || 'Unnamed Product';
    },

    getProductDescription(product) {
      if (!product) return '';

      // Handle localized descriptions
      if (product.description && typeof product.description === 'object') {
        return product.description.en || product.description[Object.keys(product.description)[0]] || '';
      }

      return product.description || '';
    },

    getProductPrice(product) {
      if (!product || !product.masterVariant) return null;

      const prices = product.masterVariant.prices;
      if (prices && prices.length > 0) {
        return prices[0].value;
      }

      return null;
    },

    formatPrice(price) {
      if (!price) return '';

      const amount = price.centAmount / 100;
      const currency = price.currencyCode || 'EUR';

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    },

    getProductInitials(product) {
      const name = this.getProductName(product);
      return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase();
    }
  }
}
</script>

<style scoped>
.category-product-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
  padding: 2rem;
}

/* Sidebar Styles */
.sidebar {
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.sidebar-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.category-item:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.category-item.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.category-name {
  font-weight: 500;
  flex: 1;
}

.product-count {
  font-size: 0.875rem;
  opacity: 0.7;
  margin-left: 0.5rem;
}

.category-item.active .product-count {
  opacity: 0.9;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.content-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #333;
}

.product-count-text {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 80px;
  height: 80px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.product-info {
  padding: 1.5rem;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.product-description {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
}

.product-categories {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #007bff;
}

/* Loading and Empty States */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.125rem;
}

.no-categories,
.no-products {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-products p {
  font-size: 1.125rem;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .sidebar {
    width: 100%;
    position: static;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-info {
    padding: 1rem;
  }
}
</style>