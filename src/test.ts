import {ctpClient} from "./client";
import {createApiBuilderFromCtpClient} from '@commercetools/platform-sdk';

const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({projectKey: 'ocm'});

// First, let's create the product type "Shirt"
/*async function createShirtProductType() {
    try {
        const productTypeDraft = {
            name: "Shirt",
            description: "Product type for shirt items",
            attributes: [
                {
                    name: "productGroup",
                    label: {
                        en: "Product Group"
                    },
                    type: {
                        name: "set",
                        elementType: {
                            name: "nested",
                            typeReference: {
                                typeId: "product-type",
                                id: "material-attribute-type" // We'll create this first
                            }
                        }
                    },
                    attributeConstraint: "None",
                    isRequired: false,
                    isSearchable: true
                }
            ]
        };

        // First create the nested type for materials


        console.log('Creating material attribute type...');
        const materialType = await apiRoot.productTypes().post({body: {
                name: "MaterialAttributeType",
                description: "Nested type for material attributes",
                attributes: [
                    {
                        name: "materialName",
                        label: {
                            en: "Material Name"
                        },
                        type: {
                            name: "text"
                        },
                        attributeConstraint: "None",
                        isRequired: true,
                        isSearchable: true
                    },
                    {
                        name: "fraction",
                        label: {
                            en: "Fraction"
                        },
                        type: {
                            name: "number"
                        },
                        attributeConstraint: "None",
                        isRequired: true,
                        isSearchable: false
                    },
                    {
                        name: "unit",
                        label: {
                            en: "Unit"
                        },
                        type: {
                            name: "enum",
                            values: [
                                {key: "percent", label: "%"},
                                {key: "gram", label: "g"},
                                {key: "kilogram", label: "kg"},
                                {key: "liter", label: "l"},
                                {key: "milliliter", label: "ml"}
                            ]
                        },
                        attributeConstraint: "None",
                        isRequired: true,
                        isSearchable: true
                    }
                ]
            }}).execute();
        console.log('Material attribute type created:', materialType.body.id);

        // Now create the main product type with reference to the material type

        console.log('Creating Shirt product type...');
        const productType = await apiRoot.productTypes().post({body: {
                ...productTypeDraft,
                attributes: [
                    {
                        name: "Obermaterial",
                        label: {
                            en: "Obermaterial"
                        },
                        type: {
                            name: "set",
                            elementType: {
                                name: "nested",
                                typeReference: {
                                    typeId: "product-type",
                                    id: materialType.body.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "Futter",
                        label: {
                            en: "Futter"
                        },
                        type: {
                            name: "set",
                            elementType: {
                                name: "nested",
                                typeReference: {
                                    typeId: "product-type",
                                    id: materialType.body.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    }
                ]
            }}).execute();
        console.log('Shirt product type created successfully:', productType.body.id);
        
        return productType.body;
    } catch (error) {
        console.error('Error creating product type:', error);
        throw error;
    }
}*/

// Create a test product with the specified values
async function createTestProduct(productTypeId: string) {
    try {
        console.log('Creating test product...');
        const product = await apiRoot.products().post({body: {
                name: {
                    en: "Test Shirt"
                },
                productType: {
                    typeId: "product-type",
                    id: productTypeId
                },
                slug: {
                    en: "test-shirt"
                },
                masterVariant: {
                    sku: "TEST-SHIRT-001",
                    attributes: [
                        {
                            name: "Obermaterial",
                            value: [
                                {
                                    attributes: [
                                        {
                                            name: "materialName",
                                            value: "Polyamid"
                                        },
                                        {
                                            name: "fraction",
                                            value: 100
                                        },
                                        {
                                            name: "unit",
                                            value: "percent"  // Just the key, not the full object
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: "Futter",
                            value: [
                                {
                                    attributes: [
                                        {
                                            name: "materialName",
                                            value: "Polyamid"
                                        },
                                        {
                                            name: "fraction",
                                            value: 100
                                        },
                                        {
                                            name: "unit",
                                            value: "percent"  // Just the key, not the full object
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                variants: []
            }}).execute();
        console.log('Test product created successfully:', product.body.id);
        
        return product.body;
    } catch (error) {
        console.error('Error creating test product:', error);
        throw error;
    }
}

// Main execution function
async function main() {
    try {
        console.log('Starting product type and product creation...');
        
        // Create the product type
        // const productType = await createShirtProductType();
        
        // Create the test product
        const product = await createTestProduct('0cb0707f-7077-47bb-8500-7a495d5b295c');
        
        console.log('All operations completed successfully!');
        console.log('Product ID:', product.id);
        
    } catch (error) {
        console.error('Main execution error:', error);
    }
}

// Run the main function
main().catch(console.error);