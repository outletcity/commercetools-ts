# Commercetools TypeScript Project

This project contains TypeScript utilities for working with the commercetools platform API.

## Project Structure

- `src/` - Source code directory
  - `client.ts` - Configuration for the commercetools API client
  - `fetchProductBySkuService.ts` - Service for fetching products by SKU
  - `vue-app/` - Vue 3 application for product search

## Vue Product Search Application

A small Vue 3 application has been added to the project that allows users to search for products by SKU using the commercetools API.

### Features

- Input field for entering product SKU
- Search button to trigger the search
- Display of product details when found
- Error handling for various scenarios

### How to Use

See the [Vue App README](src/vue-app/README.md) for detailed instructions on how to set up and run the application.

Quick start:

```bash
# Navigate to the Vue app directory
cd src/vue-app

# Install dependencies
npm install

# Build the Vue application
npm run build

# Start the server
npm start
```

The application will be available at http://localhost:3000