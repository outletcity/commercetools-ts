<template>
  <div class="product-search">
    <div class="search-container">
      <input
          type="text"
          v-model="sku"
          placeholder="Enter product SKU"
          @keyup.enter="searchProduct"
      />
      <button @click="searchProduct" :disabled="isLoading">
        {{ isLoading ? 'Searching...' : 'Search' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      Loading...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="product" class="product-data">
      <h2>Product Details</h2>

      <!-- Basic Product Information -->
      <div class="product-section">
        <h3>Basic Information</h3>
        <div class="field-grid">
          <div class="field">
            <label>ID:</label>
            <span>{{ product.id }}</span>
          </div>
          <div class="field">
            <label>Version:</label>
            <span>{{ product.version }}</span>
          </div>
          <div class="field">
            <label>Name:</label>
            <span>{{ product.name?.en || 'No name available' }}</span>
          </div>
          <div class="field">
            <label>SKU:</label>
            <span>{{ product.masterVariant?.sku }}</span>
          </div>
          <div class="field">
            <label>Slug:</label>
            <span>{{ product.slug?.en }}</span>
          </div>
          <div class="field">
            <label>Published:</label>
            <span>{{ product.published ? 'Yes' : 'No' }}</span>
          </div>
          <div class="field">
            <label>Has Staged Changes:</label>
            <span>{{ product.hasStagedChanges ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>

      <!-- Product Type -->
      <div class="product-section">
        <h3>Product Type</h3>
        <div class="field-grid">
          <div class="field">
            <label>Type ID:</label>
            <span>{{ product.productType?.typeId }}</span>
          </div>
          <div class="field">
            <label>ID:</label>
            <span>{{ product.productType?.id }}</span>
          </div>
        </div>
      </div>

      <!-- Timestamps -->
      <div class="product-section">
        <h3>Timestamps</h3>
        <div class="field-grid">
          <div class="field">
            <label>Created At:</label>
            <span>{{ formatDate(product.createdAt) }}</span>
          </div>
          <div class="field">
            <label>Last Modified At:</label>
            <span>{{ formatDate(product.lastModifiedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Master Variant Attributes -->
      <div class="product-section" v-if="product.masterVariant?.attributes?.length">
        <h3>Master Variant Attributes</h3>
        <div v-for="attribute in product.masterVariant.attributes" :key="attribute.name" class="attribute-section">
          <h4>{{ attribute.name }}</h4>
          <div v-if="Array.isArray(attribute.value)" class="fabric-compositions">
            <div v-for="(composition, index) in attribute.value" :key="index" class="composition">
              <h5>Composition {{ index + 1 }}</h5>
              <div class="composition-details">
                <div v-for="detail in composition" :key="detail.name" class="composition-item">
                  <div class="field">
                    <label>{{ detail.name }}:</label>
                    <span v-if="detail.name === 'material'">
                      {{ detail.value?.label?.en || detail.value?.key }} ({{ detail.value?.key }})
                    </span>
                    <span v-else-if="detail.name === 'unit'">
                      {{ detail.value?.label }} ({{ detail.value?.key }})
                    </span>
                    <span v-else>{{ detail.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="simple-attribute">
            <span>{{ attribute.value }}</span>
          </div>
        </div>
      </div>

      <!-- Master Variant Details -->
      <div class="product-section">
        <h3>Master Variant Details</h3>
        <div class="field-grid">
          <div class="field">
            <label>Variant ID:</label>
            <span>{{ product.masterVariant?.id }}</span>
          </div>
          <div class="field">
            <label>Assets Count:</label>
            <span>{{ product.masterVariant?.assets?.length || 0 }}</span>
          </div>
          <div class="field">
            <label>Images Count:</label>
            <span>{{ product.masterVariant?.images?.length || 0 }}</span>
          </div>
          <div class="field">
            <label>Prices Count:</label>
            <span>{{ product.masterVariant?.prices?.length || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Other Product Data -->
      <div class="product-section">
        <h3>Additional Information</h3>
        <div class="field-grid">
          <div class="field">
            <label>Categories Count:</label>
            <span>{{ product.categories?.length || 0 }}</span>
          </div>
          <div class="field">
            <label>Variants Count:</label>
            <span>{{ product.variants?.length || 0 }}</span>
          </div>
          <div class="field">
            <label>Attributes Count:</label>
            <span>{{ product.attributes?.length || 0 }}</span>
          </div>
          <div class="field">
            <label>Search Keywords:</label>
            <span>{{ Object.keys(product.searchKeywords || {}).length ? 'Available' : 'None' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="searched" class="no-product">
      No product found with SKU: {{ sku }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductSearch',
  data() {
    return {
      sku: '',
      product: null,
      isLoading: false,
      error: null,
      searched: false
    }
  },
  methods: {
    async searchProduct() {
      if (!this.sku.trim()) {
        this.error = 'Please enter a SKU';
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.product = null;

      try {
        // In a real application, this would be a proper API call
        // For now, we'll simulate the API call with a fetch to our backend
        const response = await fetch(`/api/product?sku=${encodeURIComponent(this.sku)}`);
        const data = await response.json();

        if (data.error) {
          this.error = data.error;
        } else {
          this.product = data;
        }

        this.searched = true;
      } catch (err) {
        this.error = `Error fetching product: ${err.message}`;
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    }
  }
}
</script>

<style scoped>
.product-search {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-container {
  display: flex;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading, .error, .no-product {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.loading {
  background-color: #f8f9fa;
  color: #6c757d;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

.no-product {
  background-color: #fff3cd;
  color: #856404;
}

.product-data {
  margin-top: 20px;
  text-align: left;
}

.product-section {
  margin-bottom: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #f8f9fa;
}

.product-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 5px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.field label {
  font-weight: bold;
  color: #495057;
  margin-bottom: 5px;
  font-size: 14px;
}

.field span {
  color: #212529;
  word-break: break-word;
}

.attribute-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.attribute-section h4 {
  margin: 0 0 15px 0;
  color: #495057;
  text-transform: capitalize;
}

.fabric-compositions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.composition {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.composition h5 {
  margin: 0 0 10px 0;
  color: #6c757d;
  font-size: 14px;
}

.composition-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.composition-item .field {
  padding: 8px;
  margin: 0;
}

.simple-attribute {
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .field-grid {
    grid-template-columns: 1fr;
  }

  .composition-details {
    grid-template-columns: 1fr;
  }
}
</style>