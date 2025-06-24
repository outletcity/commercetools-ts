import { ctpClient } from "./client";
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({projectKey: 'ocm'});

async function fetchProductBySku(sku: string) {
    try {
        console.log(`Fetching product with SKU: ${sku}`);
        
        const response = await apiRoot
            .productProjections()
            .search()
            .get({
                queryArgs: {
                    filter: `variants.sku:"${sku}"`,
                    limit: 1
                }
            })
            .execute();

        if (response.body.results.length === 0) {
            console.log(`No product found with SKU: ${sku}`);
            return null;
        }

        const product = response.body.results[0];
        console.log('Product data:', JSON.stringify(product, null, 2));
        
        return product;
    } catch (error) {
        console.error('Error fetching product by SKU:', error);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        await fetchProductBySku('test-shirt-001');
    } catch (error) {
        console.error('Error in main:', error);
    }
}

// Uncomment to run
// main().catch(console.error);

export { fetchProductBySku };