<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">
      Loading product details...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="product" class="product-container">
      <div class="back-button" @click="goBack">
        &larr; Back to Products
      </div>

      <div class="product-header">
        <div class="product-image">
          <!-- Use actual product image if available, otherwise show placeholder -->
          <img 
            v-if="getProductImage(product)" 
            :src="getProductImage(product)" 
            :alt="getProductName(product)"
            class="actual-image"
          />
          <div v-else class="image-placeholder">
            {{ getProductInitials(product) }}
          </div>
        </div>

        <div class="product-title">
          <h1>{{ getProductName(product) }}</h1>

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

          <!-- Available SKUs/Sizes -->
          <div class="product-variants" v-if="getProductVariants(product).length > 0">
            <h3>Available Sizes:</h3>
            <div class="variants-list">
              <div 
                v-for="variant in getProductVariants(product)" 
                :key="variant.sku"
                class="variant-item"
                :class="{ 'active': variant.sku === getCurrentSku() }"
                @click="selectVariant(variant.sku)"
              >
                {{ getVariantSize(variant) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="product-content">
        <div class="product-description" v-if="getProductDescription(product)">
          <h2>Description</h2>
          <p>{{ getProductDescription(product) }}</p>
        </div>

        <!-- Product Attributes -->
        <div class="product-attributes" v-if="product.masterVariant && product.masterVariant.attributes">
          <h2>Specifications</h2>
          <div class="attributes-list">
            <div 
              v-for="attribute in product.masterVariant.attributes" 
              :key="attribute.name"
              class="attribute-item"
            >
              <span class="attribute-name">{{ formatAttributeName(attribute.name) }}:</span>
              <span class="attribute-value">{{ formatAttributeValue(attribute.value) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="not-found">
      Product not found
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      loading: true,
      error: null,
      categories: []
    }
  },

  async mounted() {
    await this.loadCategories();
    await this.loadProduct();
  },

  methods: {
    async loadProduct() {
      this.loading = true;
      this.error = null;

      try {
        // Get the SKU from the URL query parameter
        const sku = new URLSearchParams(window.location.search).get('sku');

        if (!sku) {
          this.error = 'Product SKU is missing';
          return;
        }

        const response = await fetch(`/api/product?sku=${sku}`);

        if (!response.ok) {
          if (response.status === 404) {
            this.error = 'Product not found';
          } else {
            this.error = 'Error loading product';
          }
          return;
        }

        this.product = await response.json();
      } catch (error) {
        console.error('Error loading product:', error);
        this.error = 'Error loading product';
      } finally {
        this.loading = false;
      }
    },

    async loadCategories() {
      try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
          console.error('Error loading categories');
          return;
        }

        this.categories = await response.json();
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    },

    goBack() {
      window.history.back();
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
    },

    getCategoryNameById(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? this.getCategoryName(category) : 'Unknown Category';
    },

    getCategoryName(category) {
      if (!category) return '';

      // Handle localized names
      if (category.name && typeof category.name === 'object') {
        return category.name.en || category.name[Object.keys(category.name)[0]] || 'Unnamed Category';
      }

      return category.name || 'Unnamed Category';
    },

    formatAttributeName(name) {
      // Convert camelCase or kebab-case to Title Case with spaces
      return name
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Convert camelCase to spaces
        .replace(/-/g, ' ') // Convert kebab-case to spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    formatAttributeValue(value) {
      // Handle different types of attribute values
      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'object') {
        // Handle localized text
        if (value.en) {
          return value.en;
        }

        // Try to get the first available locale
        if (Object.keys(value).length > 0) {
          return value[Object.keys(value)[0]];
        }

        // If it's an object but not localized text, convert to string
        return JSON.stringify(value);
      }

      return value.toString();
    },

    getProductImage(product) {
      if (!product) return null;

      // Check if product has images directly
      if (product.images && product.images.length > 0) {
        return product.images[0].url;
      }

      // Check if masterVariant has images
      if (product.masterVariant && product.masterVariant.images && product.masterVariant.images.length > 0) {
        return product.masterVariant.images[0].url;
      }

      // Check for image URLs in attributes
      if (product.masterVariant && product.masterVariant.attributes) {
        for (const attr of product.masterVariant.attributes) {
          // Check for product-benefit attribute which might contain image URLs
          if (attr.name === 'product-benefit' && Array.isArray(attr.value)) {
            for (const benefit of attr.value) {
              if (benefit.imageUrl) {
                return benefit.imageUrl;
              }
            }
          }
        }
      }

      return null;
    },

    getProductVariants(product) {
      if (!product) return [];

      const variants = [];

      // Add masterVariant
      if (product.masterVariant && product.masterVariant.sku) {
        variants.push(product.masterVariant);
      }

      // Add other variants if they exist
      if (product.variants && Array.isArray(product.variants)) {
        variants.push(...product.variants);
      }

      return variants;
    },

    getCurrentSku() {
      return new URLSearchParams(window.location.search).get('sku') || '';
    },

    selectVariant(sku) {
      if (sku === this.getCurrentSku()) return;

      // Navigate to the selected variant
      window.location.href = `?sku=${encodeURIComponent(sku)}`;
    },

    getVariantSize(variant) {
      if (!variant || !variant.attributes) return '';

      // Look for size attribute
      const sizeAttr = variant.attributes.find(attr => attr.name === 'size');
      if (sizeAttr) {
        return sizeAttr.value;
      }

      // If no size attribute, return SKU as fallback
      return variant.sku;
    }
  }
}
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem;
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.back-button {
  display: inline-block;
  margin-bottom: 2rem;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.back-button:hover {
  background-color: #e9ecef;
}

.product-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.product-image {
  width: 300px;
  height: 300px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
}

.image-placeholder {
  width: 150px;
  height: 150px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
}

.actual-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.product-title {
  flex: 1;
}

.product-title h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #333;
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
  font-size: 0.875rem;
  font-weight: 500;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #007bff;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.product-variants {
  margin-top: 1.5rem;
}

.product-variants h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
}

.variants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant-item {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.variant-item:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.variant-item.active {
  border-color: #007bff;
  background-color: #007bff;
  color: white;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.product-description h2,
.product-attributes h2 {
  margin-top: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.product-description p {
  margin: 0;
  line-height: 1.6;
  color: #495057;
}

.attributes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attribute-item {
  display: flex;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f5;
}

.attribute-name {
  font-weight: 500;
  color: #6c757d;
  width: 40%;
}

.attribute-value {
  color: #212529;
  flex: 1;
}

.loading,
.error,
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: 1.25rem;
  color: #6c757d;
}

.error {
  color: #dc3545;
}

/* Responsive Design */
@media (max-width: 768px) {
  .product-header {
    flex-direction: column;
    gap: 1rem;
  }

  .product-image {
    width: 100%;
    height: 250px;
  }

  .product-content {
    grid-template-columns: 1fr;
  }
}
</style>
