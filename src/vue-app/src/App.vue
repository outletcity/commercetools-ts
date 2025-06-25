<template>
  <div id="app">
    <!-- Product List View -->
    <div v-if="currentView === 'products'" class="container">
      <h1>Products</h1>

      <!-- Search Bar -->
      <div class="search-container">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="search-input"
            @input="filterProducts"
        />
        <button @click="clearSearch" class="clear-button" v-if="searchQuery">Clear</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading products...
      </div>

      <!-- Error State -->
      <div v-if="error" class="error">
        {{ error }}
      </div>

      <!-- Product Grid -->
      <div v-if="!loading && !error" class="product-grid">
        <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-tile"
            @click="selectProduct(product)"
        >
          <div class="product-image">
            <img
                :src="getProductImage(product)"
                :alt="product.name.en || product.name[Object.keys(product.name)[0]]"
                @error="handleImageError"
            />
          </div>
          <div class="product-info">
            <h3 class="product-name">
              {{ product.name.en || product.name[Object.keys(product.name)[0]] }}
            </h3>
            <div class="product-price" v-if="getProductPrice(product)">
              {{ formatPrice(getProductPrice(product)) }}
            </div>
            <div class="product-attributes">
              <div v-for="attribute in getMasterVariantAttributes(product)" :key="attribute.name" class="attribute-item">
                <span class="attribute-name">{{ attribute.name }}:</span>
                <span class="attribute-value">{{ formatAttributeValue(attribute.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Products Found -->
      <div v-if="!loading && !error && filteredProducts.length === 0" class="no-products">
        <p v-if="searchQuery">No products found matching "{{ searchQuery }}"</p>
        <p v-else>No products available</p>
      </div>
    </div>

    <!-- Product Detail View -->
    <div v-if="currentView === 'product-detail'" class="container">
      <button @click="goBackToProducts" class="back-button">← Back to Products</button>

      <div class="product-detail">
        <div class="product-detail-image">
          <img
              :src="getProductImage(selectedProduct)"
              :alt="selectedProduct.name.en || selectedProduct.name[Object.keys(selectedProduct.name)[0]]"
              @error="handleImageError"
          />
        </div>

        <div class="product-detail-info">
          <h1>{{ selectedProduct.name.en || selectedProduct.name[Object.keys(selectedProduct.name)[0]] }}</h1>

          <!-- Color Groups -->
          <div class="color-groups" v-if="getColorGroups(selectedProduct).length > 0">
            <h3>Available Colors</h3>
            <div
                v-for="colorGroup in getColorGroups(selectedProduct)"
                :key="colorGroup.color"
                class="color-group"
            >
              <h4 class="color-name">{{ colorGroup.color }}</h4>

              <!-- Sizes for this color -->
              <div class="size-options">
                <button
                    v-for="variant in colorGroup.variants"
                    :key="variant.id"
                    class="size-button"
                    :class="{ 'active': selectedVariant && selectedVariant.id === variant.id }"
                    @click="selectVariant(variant)"
                >
                  {{ getVariantSize(variant) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Selected Variant Details -->
          <div class="selected-variant-details" v-if="selectedVariant">
            <h3>Selected Variant Details</h3>

            <div class="variant-sku">
              <strong>SKU:</strong> {{ selectedVariant.sku || 'N/A' }}
            </div>

            <div class="variant-price" v-if="getVariantPrice(selectedVariant)">
              <strong>Price:</strong> {{ formatPrice(getVariantPrice(selectedVariant)) }}
            </div>

            <div class="variant-attributes" v-if="selectedVariant.attributes && selectedVariant.attributes.length > 0">
              <h4>Attributes</h4>
              <div class="attribute-list">
                <div v-for="attribute in selectedVariant.attributes" :key="attribute.name" class="attribute-item">
                  <strong>{{ attribute.name }}:</strong> {{ formatAttributeValue(attribute.value) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Default to Master Variant if no variant selected -->
          <div class="master-variant-details" v-else>
            <h3>Product Details</h3>

            <div class="product-detail-price" v-if="getProductPrice(selectedProduct)">
              <strong>Price:</strong> {{ formatPrice(getProductPrice(selectedProduct)) }}
            </div>

            <div class="product-detail-sku">
              <strong>SKU:</strong> {{ selectedProduct.masterVariant.sku || 'N/A' }}
            </div>

            <div class="product-attributes" v-if="selectedProduct.masterVariant.attributes && selectedProduct.masterVariant.attributes.length > 0">
              <h4>Attributes</h4>
              <div class="attribute-list">
                <div v-for="attribute in selectedProduct.masterVariant.attributes" :key="attribute.name" class="attribute-item">
                  <strong>{{ attribute.name }}:</strong> {{ formatAttributeValue(attribute.value) }}
                </div>
              </div>
            </div>
          </div>

          <div class="product-detail-description" v-if="selectedProduct.description">
            <h3>Description</h3>
            <p>{{ selectedProduct.description?.en || selectedProduct.description?.[Object.keys(selectedProduct.description || {})[0]] || 'No description available' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      products: [],
      filteredProducts: [],
      searchQuery: '',
      loading: false,
      error: null,
      currentView: 'products', // 'products' or 'product-detail'
      selectedProduct: null,
      selectedVariant: null
    };
  },
  async mounted() {
    await this.loadProducts();
  },
  methods: {
    async loadProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('/api/products');
        this.products = response.data;
        this.filteredProducts = [...this.products];
      } catch (error) {
        this.error = 'Failed to load products. Please try again.';
        console.error('Error loading products:', error);
      } finally {
        this.loading = false;
      }
    },

    filterProducts() {
      if (!this.searchQuery.trim()) {
        this.filteredProducts = [...this.products];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.filteredProducts = this.products.filter(product => {
        const name = (product.name.en || product.name[Object.keys(product.name)[0]] || '').toLowerCase();
        const sku = (product.masterVariant.sku || '').toLowerCase();

        return name.includes(query) || sku.includes(query);
      });
    },

    clearSearch() {
      this.searchQuery = '';
      this.filteredProducts = [...this.products];
    },

    selectProduct(product) {
      this.selectedProduct = product;
      this.selectedVariant = null; // Reset variant selection
      this.currentView = 'product-detail';
    },

    selectVariant(variant) {
      this.selectedVariant = variant;
    },

    goBackToProducts() {
      this.currentView = 'products';
      this.selectedProduct = null;
      this.selectedVariant = null;
    },

    getProductImage(product) {
      if (product.masterVariant.images && product.masterVariant.images.length > 0) {
        return product.masterVariant.images[0].url;
      }
      return 'https://via.placeholder.com/382x573?text=No+Image';
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/382x573?text=No+Image';
    },

    getProductPrice(product) {
      if (product.masterVariant.prices && product.masterVariant.prices.length > 0) {
        return product.masterVariant.prices[0];
      }
      return null;
    },

    getVariantPrice(variant) {
      if (variant.prices && variant.prices.length > 0) {
        return variant.prices[0];
      }
      return null;
    },

    getMasterVariantAttributes(product) {
      return product.masterVariant.attributes || [];
    },

    getColorGroups(product) {
      if (!product.variants || product.variants.length === 0) {
        return [];
      }

      const colorGroups = {};

      // Include master variant
      const masterColor = this.getVariantColor(product.masterVariant);
      if (masterColor) {
        colorGroups[masterColor] = {
          color: masterColor,
          variants: [product.masterVariant]
        };
      }

      // Group variants by color
      product.variants.forEach(variant => {
        const color = this.getVariantColor(variant);
        if (color) {
          if (!colorGroups[color]) {
            colorGroups[color] = {
              color: color,
              variants: []
            };
          }
          colorGroups[color].variants.push(variant);
        }
      });

      return Object.values(colorGroups);
    },

    getVariantColor(variant) {
      if (!variant.attributes) return 'Default';

      const colorAttribute = variant.attributes.find(attr =>
          attr.name.toLowerCase().includes('color') ||
          attr.name.toLowerCase().includes('colour')
      );

      if (colorAttribute) {
        return this.formatAttributeValue(colorAttribute.value);
      }

      return 'Default';
    },

    getVariantSize(variant) {
      if (!variant.attributes) return 'One Size';

      const sizeAttribute = variant.attributes.find(attr =>
          attr.name.toLowerCase().includes('size')
      );

      if (sizeAttribute) {
        return this.formatAttributeValue(sizeAttribute.value);
      }

      return variant.sku || 'One Size';
    },

    formatPrice(price) {
      if (!price) return 'Price not available';

      const amount = price.value.centAmount / 100;
      const currency = price.value.currencyCode;

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    },

    formatAttributeValue(value) {
      if (!value) return '';

      if (typeof value === 'object') {
        if (value.label) {
          return value.label.en || value.label[Object.keys(value.label)[0]] || value.key || '';
        }
        if (Array.isArray(value)) {
          return value.map(item => this.formatAttributeValue(item)).join(', ');
        }
        return JSON.stringify(value);
      }

      return String(value);
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

/* Search Bar Styles */
.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.search-input {
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  width: 300px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.clear-button {
  padding: 12px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.clear-button:hover {
  background-color: #5a6268;
}

/* Product Grid Styles */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.product-tile {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  background: white;
  display: flex;
  flex-direction: column;
}

.product-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
  line-height: 1.3;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 16px;
}

.product-attributes {
  flex: 1;
}

.product-attributes .attribute-item {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.attribute-name {
  font-weight: 500;
  color: #555;
}

.attribute-value {
  color: #777;
  margin-left: 4px;
}

/* Product Detail Styles */
.back-button {
  padding: 10px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #5a6268;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.product-detail-image {
  width: 100%;
}

.product-detail-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.product-detail-info h1 {
  text-align: left;
  margin-bottom: 20px;
}

/* Color Groups */
.color-groups {
  margin-bottom: 30px;
}

.color-group {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.color-name {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-button {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.size-button:hover {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.size-button.active {
  border-color: #007bff;
  background-color: #007bff;
  color: white;
}

/* Variant Details */
.selected-variant-details,
.master-variant-details {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.variant-sku,
.product-detail-sku {
  margin-bottom: 12px;
  font-size: 16px;
}

.variant-price,
.product-detail-price {
  font-size: 20px;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 16px;
}

.variant-attributes h4,
.product-attributes h4 {
  margin: 16px 0 12px 0;
  color: #333;
}

.attribute-list {
  margin-bottom: 16px;
}

.attribute-list .attribute-item {
  margin-bottom: 8px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  font-size: 14px;
}

.product-detail-description {
  margin-top: 20px;
}

.product-detail-description h3 {
  margin-bottom: 12px;
  color: #333;
}

.product-detail-description p {
  line-height: 1.6;
  color: #666;
}

/* Utility Styles */
.loading, .error, .no-products {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #dc3545;
}

.loading {
  color: #6c757d;
}

.no-products {
  color: #6c757d;
}
</style>