import {ctpClient} from "./client";
import {createApiBuilderFromCtpClient} from '@commercetools/platform-sdk';
import {fetchAllPublishedProducts, fetchStyleByKey} from "./fetchProductBySkuService";
import {ProductService} from "./product-service";
import { createShirtProductType } from "./typeDeclarations/shirt";

export const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({projectKey: 'ocm'});

// First, let's create the product type "Shirt"

// Create a test product with the specified values


// Main execution function
/*async function createClothingAttributeGroups() {
    try {
        // 1. Material Information Group
        const materialGroup = await apiRoot.attributeGroups().post({
            body: {
                name: {
                    en: "Material Information",
                    de: "Materialinformationen"
                },
                description: {
                    en: "All attributes related to materials and fabric composition",
                    de: "Alle Attribute zu Materialien und Stoffzusammensetzung"
                },
                attributes: [
                    {
                        key: "Obermaterial",
                    },
                    {
                        key: "Futter1",

                    }
                ]
            }
        }).execute();

        console.log('Material group created:', materialGroup.body.id);
    } catch (error) {
        console.error('Error creating clothing attribute groups:', error);
        throw error;
    }
}*/

async function main() {
    try {
        // createShirtProductType();
        let productService = new ProductService('3e3f5ac3-6cb4-4b93-a259-82422706df61');

        // Create 10 test products with different style codes, names and real brand names
        const styles = [
            {
                styleCode: "NKE-AF1-001",
                name: "Air Force 1 Low White",
                brand: "Nike"
            },
            {
                styleCode: "ADI-UB22-002",
                name: "Ultraboost 22 Triple Black",
                brand: "Adidas"
            },
            {
                styleCode: "NKE-DNK-003",
                name: "Dunk Low University Blue",
                brand: "Nike"
            },
            {
                styleCode: "PMA-RS-004",
                name: "RS-X Efekt Multicolor",
                brand: "Puma"
            },
            {
                styleCode: "NBL-990-005",
                name: "990v5 Grey Castle Rock",
                brand: "New Balance"
            },
            {
                styleCode: "VNS-OLD-006",
                name: "Old Skool Flame Black",
                brand: "Vans"
            },
            {
                styleCode: "CVS-CTS-007",
                name: "Chuck Taylor All Star High",
                brand: "Converse"
            },
            {
                styleCode: "ADI-SB-008",
                name: "Samba OG Cloud White",
                brand: "Adidas"
            },
            {
                styleCode: "RBK-CLS-009",
                name: "Classic Leather Vintage",
                brand: "Reebok"
            },
            {
                styleCode: "ASC-GEL-010",
                name: "Gel-Lyte III Cream Sage",
                brand: "ASICS"
            }
        ];

        console.log('Creating 10 different styles:');

        for (const style of styles) {
            console.log(`Style Code: ${style.styleCode}`);
            console.log(`Name: ${style.name}`);
            console.log(`Brand: ${style.brand}`);
            console.log('---');

            // You can use productService here to create actual products
            productService.createTestProduct(style.styleCode, style.name, style.brand);
        }



        // fetchAllPublishedProducts();
        // const product = await fetchStyleByKey("00000001");

    } catch (error) {
        console.error('Main execution error:', error);
    }
}

// Run the main function
main().catch(console.error);



