# Product Search App

A small Vue 3 application that allows users to search for products by SKU using the commercetools API.

## Features

- Input field for entering product SKU
- Search button to trigger the search
- Display of product details when found
- Error handling for various scenarios

## Project Setup

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```
   cd src/vue-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Building the Vue App

Build the Vue application for production:
```
npm run build
```

This will create a `dist` directory with the compiled application.

### Running the Server

Start the Express server which serves the Vue app and handles API requests:
```
npm start
```

The application will be available at http://localhost:3000

## How It Works

1. The Vue frontend provides a user interface for entering a SKU and displaying product data
2. When a user searches for a product, the frontend makes a request to the `/api/product` endpoint
3. The Express server receives the request and calls the `fetchProductBySku` function from the commercetools service
4. The product data is returned to the frontend and displayed to the user

## Development

For development with hot-reload:
```
npm run serve
```

This will start the Vue development server, but API requests will need to be proxied to the Express server.