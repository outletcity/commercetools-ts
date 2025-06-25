
import { ctpClient } from "./client";
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({projectKey: 'ocm'});

export async function fetchStyleByKey(productKey: string) {
    try {
        console.log(`Fetching all variants for product ID: ${productKey}`);

        const response = await apiRoot
            .productProjections()
            .withKey({ key: productKey })
            .get()
            .execute();

        const product = response.body;
        console.dir(product, { depth: null });
        return product;
    } catch (error) {
        console.error('Error fetching product variants by ID:', error);
        throw error;
    }
}

export async function fetchAllPublishedProducts() {
    try {
        console.log('Fetching all published products');

        const response = await apiRoot
            .productProjections()
            .search()
            .get({
                queryArgs: {
                    staged: false, // Get published products only
                    limit: 100    // Adjust limit as needed
                }
            })
            .execute();

        const products = response.body.results;
        console.log(products);
        return products;
    } catch (error) {
        console.error('Error fetching published products:', error);
        throw error;
    }
}
