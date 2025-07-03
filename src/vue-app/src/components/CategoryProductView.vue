
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

        <!-- Category Statistics Overview -->
        <div v-if="categories.length > 0" class="category-overview">
          <div class="overview-header">
            <h3>Category Overview</h3>
            <button
                @click="showCategoryDetails = !showCategoryDetails"
                class="toggle-details"
                type="button"
            >
              {{ showCategoryDetails ? 'Hide Details' : 'Show Details' }}
            </button>
          </div>

          <div class="overview-stats">
            <div class="stat-item">
              <span class="stat-label">Total Categories:</span>
              <span class="stat-value">{{ categories.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Root Categories:</span>
              <span class="stat-value">{{ categoryTree.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Categories with Products:</span>
              <span class="stat-value">{{ categoriesWithProducts }}</span>
            </div>
          </div>

          <!-- Detailed Category List -->
          <div v-if="showCategoryDetails" class="category-details">
            <div class="category-filters">
              <input
                  type="text"
                  v-model="categorySearchQuery"
                  placeholder="Search categories..."
                  class="category-search"
              />
              <select v-model="categoryFilter" class="category-filter-select">
                <option value="all">All Categories</option>
                <option value="root">Root Only</option>
                <option value="withProducts">With Products</option>
                <option value="withoutProducts">Without Products</option>
              </select>
            </div>

            <div class="flat-category-list">
              <div
                  v-for="category in filteredCategoriesFlat"
                  :key="category.id"
                  class="flat-category-item"
                  :class="{
                  'active': selectedCategory?.id === category.id,
                  'has-products': getCategoryProductCount(category.id) > 0,
                  'is-root': !category.parent,
                  'is-child': category.parent
                }"
                  @click="selectCategory(category)"
              >
                <div class="category-info">
                  <span class="category-hierarchy">
                    {{ getCategoryHierarchyPath(category) }}
                  </span>
                  <span class="category-name-flat">
                    {{ getCategoryName(category) }}
                  </span>
                </div>
                <div class="category-meta">
                  <span class="category-type">
                    {{ category.parent ? 'Child' : 'Root' }}
                  </span>
                  <span class="product-count-flat">
                    ({{ getCategoryProductCount(category.id) }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="categoriesLoading" class="loading">
          Loading categories...
        </div>

        <!-- Categories Tree -->
        <div v-else-if="categoryTree.length > 0" class="categories-list">
          <h3 class="tree-title">Category Tree</h3>
          <CategoryTreeItem
              v-for="category in categoryTree"
              :key="category.id"
              :category="category"
              :selected-category="selectedCategory"
              :category-product-counts="categoryProductCounts"
              :all-categories="categories"
              @select-category="selectCategory"
          />
        </div>

        <!-- No Categories -->
        <div v-else class="no-categories">
          No categories found
        </div>

        <!-- Debug Info -->
        <div v-if="showDebugInfo" class="debug-info">
          <h4>Debug Info:</h4>
          <p>Total categories: {{ categories.length }}</p>
          <p>Root categories: {{ categoryTree.length }}</p>
          <details>
            <summary>Raw categories</summary>
            <pre>{{ JSON.stringify(categories, null, 2) }}</pre>
          </details>
          <details>
            <summary>Category tree</summary>
            <pre>{{ JSON.stringify(categoryTree, null, 2) }}</pre>
          </details>
        </div>
      </div>

      <!-- Main Content - Products -->
      <div class="main-content">
        <!-- Search Bar -->
        <div class="search-container">
          <input
              type="text"
              v-model="searchQuery"
              placeholder="Search products..."
              class="search-input"
              @input="searchProducts"
          />
          <!-- Debug Toggle -->
          <button
              @click="showDebugInfo = !showDebugInfo"
              class="debug-toggle"
              type="button"
          >
            {{ showDebugInfo ? 'Hide' : 'Show' }} Debug
          </button>
        </div>

        <div class="content-header">
          <h1 class="page-title">
            {{ selectedCategory ? getCategoryName(selectedCategory) : 'All Products' }}
          </h1>
          <p class="product-count-text">
            {{ filteredProducts.length }} product{{ filteredProducts.length !== 1 ? 's' : '' }} found
          </p>
          <!-- Category Breadcrumb -->
          <div v-if="selectedCategory" class="category-breadcrumb">
            <span class="breadcrumb-label">Category Path:</span>
            <span class="breadcrumb-path">{{ getCategoryHierarchyPath(selectedCategory) }}</span>
          </div>
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
              @click="viewProductDetails(product)"
          >
            <div class="product-image">
              <!-- Product Image with proper aspect ratio -->
              <img
                  v-if="getProductImageUrl(product)"
                  :src="getProductImageUrl(product)"
                  :alt="getProductName(product)"
                  class="product-img"
                  @error="handleImageError"
              />
              <!-- Fallback placeholder -->
              <div v-else class="image-placeholder">
                {{ getProductInitials(product) }}
              </div>
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ getProductName(product) }}</h3>
              <p class="product-description" v-if="getProductDescription(product)">
                {{ getProductDescription(product) }}
              </p>

              <!-- Available Variants (Sizes) -->
              <div class="product-variants" v-if="getProductVariants(product).length > 0">
                <h4 class="variants-title">Available Sizes:</h4>
                <div class="variants-list">
                  <span
                      v-for="variant in getProductVariants(product)"
                      :key="variant.id"
                      class="variant-tag"
                      :class="{ 'out-of-stock': !isVariantAvailable(variant) }"
                  >
                    {{ getVariantSize(variant) }}
                    <span v-if="!isVariantAvailable(variant)" class="out-of-stock-label">
                      (Out of Stock)
                    </span>
                  </span>
                </div>
              </div>

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
// Separate CategoryTreeItem component for Vue 3
const CategoryTreeItem = {
  name: 'CategoryTreeItem',
  template: `
    <div class="category-tree-item">
      <!-- Category item -->
      <div
          :class="{
          'category-item': true,
          'active': isSelected,
          'category-item-with-children': hasChildren,
          'expanded': expanded
        }"
          @click="handleCategoryClick"
      >
        <!-- Toggle button for categories with children -->
        <span
            v-if="hasChildren"
            class="category-toggle"
            @click.stop="toggleExpand"
        >
          {{ expanded ? '−' : '+' }}
        </span>

        <span class="category-name">{{ getCategoryName(category) }}</span>
        <span class="product-count">({{ getCategoryProductCount(category.id) }})</span>
      </div>

      <!-- Children (if any and expanded) -->
      <div v-if="hasChildren && expanded" class="category-children">
        <CategoryTreeItem
            v-for="child in category.children"
            :key="child.id"
            :category="child"
            :selected-category="selectedCategory"
            :category-product-counts="categoryProductCounts"
            :all-categories="allCategories"
            @select-category="$emit('select-category', $event)"
        />
      </div>
    </div>
  `,
  props: {
    category: {
      type: Object,
      required: true
    },
    selectedCategory: {
      type: Object,
      default: null
    },
    categoryProductCounts: {
      type: Object,
      required: true
    },
    allCategories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select-category'],
  data() {
    return {
      expanded: false
    };
  },
  computed: {
    hasChildren() {
      return this.category.children && this.category.children.length > 0;
    },
    isSelected() {
      return this.selectedCategory?.id === this.category.id;
    },
    shouldAutoExpand() {
      const isSelected = this.selectedCategory?.id === this.category.id;
      const hasSelectedChild = this.hasChildren && this.category.children.some(child =>
          child.id === this.selectedCategory?.id ||
          (child.children && child.children.some(grandchild => grandchild.id === this.selectedCategory?.id))
      );
      return isSelected || hasSelectedChild;
    }
  },
  watch: {
    shouldAutoExpand: {
      immediate: true,
      handler(newVal) {
        if (newVal && !this.expanded) {
          this.expanded = true;
        }
      }
    }
  },
  methods: {
    getCategoryName(category) {
      if (!category) return '';

      // Handle localized names
      if (category.name && typeof category.name === 'object') {
        return category.name.en || category.name[Object.keys(category.name)[0]] || 'Unnamed Category';
      }

      return category.name || 'Unnamed Category';
    },
    getCategoryProductCount(categoryId) {
      return this.categoryProductCounts[categoryId] || 0;
    },
    handleCategoryClick() {
      // When a category is selected, expand it to show its children
      if (this.hasChildren) {
        this.expanded = true;
      }
      this.$emit('select-category', this.category);
    },
    toggleExpand() {
      // Toggle expanded state when the toggle button is clicked
      if (this.hasChildren) {
        this.expanded = !this.expanded;
      }
    }
  }
};

export default {
  name: 'CategoryProductView',
  components: {
    CategoryTreeItem
  },
  data() {
    return {
      categories: [],
      categoryTree: [],
      allProducts: [],
      filteredProducts: [],
      selectedCategory: null,
      categoriesLoading: false,
      productsLoading: false,
      categoryProductCounts: {},
      searchQuery: '',
      showDebugInfo: false,
      showCategoryDetails: false,
      categorySearchQuery: '',
      categoryFilter: 'all'
    }
  },

  computed: {
    totalProductsCount() {
      return this.allProducts.length;
    },

    categoriesWithProducts() {
      return Object.values(this.categoryProductCounts).filter(count => count > 0).length;
    },

    filteredCategoriesFlat() {
      let filtered = [...this.categories];

      // Apply search filter
      if (this.categorySearchQuery.trim()) {
        const query = this.categorySearchQuery.toLowerCase().trim();
        filtered = filtered.filter(category => {
          const name = this.getCategoryName(category).toLowerCase();
          const path = this.getCategoryHierarchyPath(category).toLowerCase();
          return name.includes(query) || path.includes(query);
        });
      }

      // Apply category filter
      switch (this.categoryFilter) {
        case 'root':
          filtered = filtered.filter(category => !category.parent);
          break;
        case 'withProducts':
          filtered = filtered.filter(category => this.getCategoryProductCount(category.id) > 0);
          break;
        case 'withoutProducts':
          filtered = filtered.filter(category => this.getCategoryProductCount(category.id) === 0);
          break;
        default:
          // 'all' - no additional filtering
          break;
      }

      // Sort by hierarchy path for better organization
      return filtered.sort((a, b) => {
        const pathA = this.getCategoryHierarchyPath(a);
        const pathB = this.getCategoryHierarchyPath(b);
        return pathA.localeCompare(pathB);
      });
    }
  },

  async mounted() {
    await this.loadCategories();
    await this.loadAllProducts();
    this.buildCategoryTree();
  },

  methods: {
    getCategoryHierarchyPath(category) {
      if (!category) return '';

      const path = [];
      let current = category;

      // Build path from current category up to root
      while (current) {
        path.unshift(this.getCategoryName(current));

        // Find parent category
        if (current.parent && current.parent.id) {
          current = this.categories.find(cat => cat.id === current.parent.id);
        } else {
          current = null;
        }
      }

      return path.join(' > ');
    },

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
      const fetchCategoryProductCount = async (categoryId) => {
        try {
          const response = await fetch(`/api/products/category/${categoryId}`);
          if (response.ok) {
            const products = await response.json();
            this.categoryProductCounts[categoryId] = products.length;
            return products.length;
          }
          return 0;
        } catch (error) {
          console.error(`Error loading product count for category ${categoryId}:`, error);
          this.categoryProductCounts[categoryId] = 0;
          return 0;
        }
      };

      // Process all categories including nested ones
      const promises = this.categories.map(category => fetchCategoryProductCount(category.id));
      await Promise.all(promises);

      console.log('Product counts loaded for all categories');
    },

    async selectCategory(category) {
      this.selectedCategory = category;
      this.productsLoading = true;

      // Reset search query when changing categories
      this.searchQuery = '';

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
    },

    // New method to get product image URL
    getProductImageUrl(product) {
      if (!product || !product.masterVariant) return null;

      const images = product.masterVariant.images;
      if (images && images.length > 0) {
        return images[0].url;
      }

      return null;
    },

    // New method to get all product variants
    getProductVariants(product) {
      if (!product || !product.variants) return [];

      // Include master variant and all other variants
      const allVariants = [product.masterVariant, ...product.variants];
      return allVariants.filter(variant => variant && variant.id);
    },

    // New method to get variant size
    getVariantSize(variant) {
      if (!variant || !variant.attributes) return 'N/A';

      // Look for size attribute (common attribute names for sizes)
      const sizeAttributes = ['size', 'Size', 'SIZE', 'groesse', 'Größe'];

      for (const attrName of sizeAttributes) {
        const sizeAttr = variant.attributes.find(attr => attr.name === attrName);
        if (sizeAttr) {
          // Handle different value types
          if (typeof sizeAttr.value === 'string') {
            return sizeAttr.value;
          } else if (sizeAttr.value && sizeAttr.value.label) {
            return sizeAttr.value.label;
          } else if (sizeAttr.value && sizeAttr.value.key) {
            return sizeAttr.value.key;
          }
        }
      }

      // If no size attribute found, try to get SKU or variant ID
      return variant.sku || `Variant ${variant.id}`;
    },

    // New method to check if variant is available
    isVariantAvailable(variant) {
      if (!variant || !variant.availability) return true;

      // Check if variant has availability info
      const availability = variant.availability;

      // Check if there's channel-specific availability
      if (availability.channels) {
        // Check if any channel has stock
        return Object.values(availability.channels).some(channel =>
            channel.availableQuantity > 0
        );
      }

      // Check general availability
      if (availability.availableQuantity !== undefined) {
        return availability.availableQuantity > 0;
      }

      // Default to available if no availability info
      return true;
    },

    // Error handler for failed image loads
    handleImageError(event) {
      // Hide the broken image and show placeholder
      event.target.style.display = 'none';
      const placeholder = event.target.parentElement.querySelector('.image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
    },

    buildCategoryTree() {
      console.log('Building category tree from categories:', this.categories);

      if (!this.categories || this.categories.length === 0) {
        console.log('No categories to build tree from');
        this.categoryTree = [];
        return;
      }

      // Create a map of categories by ID for quick lookup
      const categoryMap = {};
      this.categories.forEach(category => {
        // Clone the category to avoid modifying the original
        categoryMap[category.id] = {
          ...category,
          children: [],
          // Keep original reference for debugging
          _original: category
        };
      });

      console.log('Category map created:', categoryMap);

      // Build the tree structure
      const rootCategories = [];

      this.categories.forEach(category => {
        console.log(`Processing category: ${this.getCategoryName(category)} (ID: ${category.id})`);

        // Check if the category has a parent
        if (category.parent && category.parent.id) {
          console.log(`  - Has parent: ${category.parent.id}`);

          // Check if parent exists in our category map
          if (categoryMap[category.parent.id]) {
            console.log(`  - Adding as child to parent ${category.parent.id}`);
            // Add this category as a child of its parent
            categoryMap[category.parent.id].children.push(categoryMap[category.id]);
          } else {
            console.log(`  - Parent ${category.parent.id} not found in map, treating as root`);
            // Parent not found, treat as root category
            rootCategories.push(categoryMap[category.id]);
          }
        } else {
          console.log(`  - No parent, treating as root category`);
          // This is a root category
          rootCategories.push(categoryMap[category.id]);
        }
      });

      console.log('Root categories found:', rootCategories);

      // Sort root categories and their children by name
      this.sortCategoriesByName(rootCategories);

      // Update the categoryTree
      this.categoryTree = rootCategories;

      console.log('Final category tree:', this.categoryTree);
    },

    sortCategoriesByName(categories) {
      if (!categories || categories.length === 0) return;

      // Sort the categories by name
      categories.sort((a, b) => {
        const nameA = this.getCategoryName(a).toLowerCase();
        const nameB = this.getCategoryName(b).toLowerCase();
        return nameA.localeCompare(nameB);
      });

      // Sort children recursively
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          this.sortCategoriesByName(category.children);
        }
      });
    },

    searchProducts() {
      if (!this.searchQuery.trim()) {
        // If search query is empty, show all products or products from selected category
        if (this.selectedCategory) {
          this.selectCategory(this.selectedCategory);
        } else {
          this.filteredProducts = this.allProducts;
        }
        return;
      }

      const query = this.searchQuery.toLowerCase().trim();

      // Filter products based on search query
      let productsToSearch = this.selectedCategory ?
          this.filteredProducts : this.allProducts;

      this.filteredProducts = productsToSearch.filter(product => {
        const name = this.getProductName(product).toLowerCase();
        const description = this.getProductDescription(product).toLowerCase();

        // Search in name and description
        return name.includes(query) || description.includes(query);
      });
    },

    viewProductDetails(product) {
      if (!product || !product.masterVariant || !product.masterVariant.sku) {
        console.error('Product does not have a valid SKU');
        return;
      }

      const sku = product.masterVariant.sku;

      // Navigate to product detail page with SKU as query parameter
      window.location.href = `?sku=${encodeURIComponent(sku)}`;
    },

    getProductSku(product) {
      if (!product || !product.masterVariant) return null;
      return product.masterVariant.sku;
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
  width: 350px;
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

/* Category Overview Styles */
.category-overview {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.overview-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #495057;
}

.toggle-details {
  padding: 0.25rem 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.toggle-details:hover {
  background: #0056b3;
}

.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #6c757d;
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

/* Category Details Styles */
.category-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.category-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.category-search {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
}

.category-filter-select {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
}

.flat-category-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.flat-category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.flat-category-item:hover {
  background-color: #f8f9fa;
}

.flat-category-item.active {
  background-color: #007bff;
  color: white;
}

.flat-category-item.is-root {
  font-weight: 600;
}

.flat-category-item.is-child {
  font-style: italic;
}

.flat-category-item.has-products {
  border-left: 3px solid #28a745;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-hierarchy {
  font-size: 0.75rem;
  color: #6c757d;
  opacity: 0.8;
}

.flat-category-item.active .category-hierarchy {
  color: rgba(255, 255, 255, 0.8);
}

.category-name-flat {
  font-size: 0.875rem;
  font-weight: 500;
}

.category-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.category-type {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
  background: #e9ecef;
  color: #495057;
}

.flat-category-item.active .category-type {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.product-count-flat {
  font-size: 0.75rem;
  font-weight: 600;
}

/* Tree Title */
.tree-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #495057;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
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

.category-tree-item {
  margin-bottom: 0.5rem;
}

.category-children {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  border-left: 1px dashed #dee2e6;
  padding-left: 0.5rem;
}

.category-children .category-children {
  margin-left: 1rem;
}

.child-category {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.category-tree-item {
  position: relative;
}

.category-tree-item .category-item {
  margin-bottom: 0.25rem;
}

/* Add a visual indicator for expandable categories */
.category-item {
  position: relative;
}

/* Category toggle button styles */
.category-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  color: #6c757d;
  transition: transform 0.2s ease;
}

.category-item.active .category-toggle {
  color: white;
}

.category-item.expanded .category-toggle {
  transform: rotate(0deg);
}

/* Add a subtle background to the toggle on hover */
.category-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.category-item.active .category-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Debug Info Styles */
.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 0.875rem;
}

.debug-info h4 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.debug-info details {
  margin: 0.5rem 0;
}

.debug-info summary {
  cursor: pointer;
  font-weight: 500;
  color: #007bff;
}

.debug-info pre {
  background: white;
  padding: 0.5rem;
  border-radius: 3px;
  overflow-x: auto;
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.debug-toggle {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.debug-toggle:hover {
  background: #0056b3;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.search-container {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 1rem;
}

.category-breadcrumb {
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.breadcrumb-label {
  color: #6c757d;
  margin-right: 0.5rem;
}

.breadcrumb-path {
  color: #007bff;
  font-weight: 500;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: white;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Updated Image Styles - Show full image */
.product-image {
  height: 280px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 10px;
}

.product-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.2s ease;
  border-radius: 4px;
}

.product-card:hover .product-img {
  transform: scale(1.02);
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

/* Product Variants Styles */
.product-variants {
  margin-bottom: 1rem;
}

.variants-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.variants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant-tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.variant-tag.out-of-stock {
  background: #f8d7da;
  color: #721c24;
}

.out-of-stock-label {
  font-size: 0.6rem;
  opacity: 0.8;
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

  .product-image {
    height: 220px;
    padding: 8px;
  }

  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .debug-toggle {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .category-filters {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-info {
    padding: 1rem;
  }

  .variants-list {
    gap: 0.25rem;
  }

  .variant-tag {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }

  .product-image {
    height: 200px;
    padding: 6px;
  }

  .overview-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}
</style>