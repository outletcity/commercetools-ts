//create a class product service
import {apiRoot} from "./main";
import {MATERIAL_VALUES} from "./typeDeclarations/materialValues";

export class ProductService {

    productTypeId: string;

    constructor(productTypeId: string) {
        this.productTypeId = productTypeId;
    }

    getCommonAttributes(brandName: string = "Test Brand") {
        return [
            {
                name: "brand-name",
                value: brandName
            },
            {
                name: "outer-fabric1",
                value: [
                    {
                        material: MATERIAL_VALUES.KAMEL.key,
                        fraction: 50,
                        unit: "percent"
                    },
                    {
                        material: MATERIAL_VALUES.KASCHGORA.key,
                        fraction: 50,
                        unit: "percent"
                    }
                ]
            },
            {
                name: "outer-fabric2",
                value: [
                    {
                        material: MATERIAL_VALUES.HENEQUEN.key,
                        fraction: 100,
                        unit: "percent"
                    }
                ]
            },
            {
                name: "lining1",
                value: [
                    {
                        material: "BIBER",
                        fraction: 100,
                        unit: "percent"
                    }
                ]
            },
            {
                name: "product-benefit",
                value: [
                    {
                        code: "water-resistant",
                        name: {
                            "en": "Water Resistant",
                            "de": "Wasserabweisend"
                        },
                        imageUrl: "https://example.com/images/water-resistant.png"
                    }
                ]
            }
        ];
    }

    // Simplified version for testing
    getSimpleAttributes(brandName: string = "Test Brand") {
        return [
            {
                name: "brand-name",
                value: brandName
            }
        ];
    }

    // Alternative simplified product creation method for debugging
    async createSimpleProduct(
        styleCode: string,
        name: string,
        brandName: string = "Test Brand",
        categoryIds: string[] = []
    ) {
        try {
            console.log('Creating simple product...');

            const categories = categoryIds.map(id => ({
                typeId: "category" as const,
                id: id
            }));

            const simpleProductData = {
                name: {
                    en: name
                },
                productType: {
                    typeId: "product-type" as const,
                    id: this.productTypeId
                },
                key: styleCode,
                slug: {
                    en: styleCode
                },
                masterVariant: {
                    sku: `${styleCode}-simple`,
                    attributes: [
                        {
                            name: "brand-name",
                            value: brandName
                        },
                        {
                            name: "size",
                            value: "M"
                        },
                        {
                            name: "color",
                            value: "blue"
                        },
                        {
                            name: "display-color",
                            value: {
                                en: "Blue"
                            }
                        }
                    ],
                    prices: [
                        {
                            value: {
                                currencyCode: "EUR",
                                centAmount: 1999
                            }
                        }
                    ]
                },
                ...(categories.length > 0 && { categories })
            };

            const product = await apiRoot.products().post({
                body: simpleProductData
            }).execute();

            console.log('Simple product created successfully:', product.body.id);
            return product.body;
        } catch (error) {
            console.error('Error creating simple product:', error);
            console.dir(error, {depth: null});
            throw error;
        }
    }

    async addProductToCategories(productId: string, categoryIds: string[]) {
        try {
            // First get the current product to get its version
            const currentProduct = await apiRoot.products().withId({ ID: productId }).get().execute();

            // Add categories one by one
            let product = currentProduct.body;
            for (const categoryId of categoryIds) {
                try {
                    const result = await apiRoot.products().withId({ ID: productId }).post({
                        body: {
                            version: product.version,
                            actions: [
                                {
                                    action: "addToCategory",
                                    category: {
                                        typeId: "category" as const,
                                        id: categoryId
                                    }
                                }
                            ]
                        }
                    }).execute();
                    product = result.body;
                    console.log(`Added product to category ${categoryId}`);
                } catch (error) {
                    console.error(`Error adding product to category ${categoryId}:`, error);
                }
            }

            console.log('Product added to categories successfully');
            return product;
        } catch (error) {
            console.error('Error adding product to categories:', error);
            throw error;
        }
    }

    async removeProductFromCategory(productId: string, categoryId: string) {
        try {
            // Get current product version
            const currentProduct = await apiRoot.products().withId({ ID: productId }).get().execute();

            const updatedProduct = await apiRoot.products().withId({ ID: productId }).post({
                body: {
                    version: currentProduct.body.version,
                    actions: [
                        {
                            action: "removeFromCategory",
                            category: {
                                typeId: "category" as const,
                                id: categoryId
                            }
                        }
                    ]
                }
            }).execute();

            console.log('Product removed from category successfully');
            return updatedProduct.body;
        } catch (error) {
            console.error('Error removing product from category:', error);
            throw error;
        }
    }

    async getProductsByCategory(categoryId: string) {
        try {
            const products = await apiRoot.productProjections().search().get({
                queryArgs: {
                    filter: [`categories.id:"${categoryId}"`]
                }
            }).execute();

            return products.body.results;
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw error;
        }
    }
}