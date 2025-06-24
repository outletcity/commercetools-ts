import {ctpClient} from "./client";
import {createApiBuilderFromCtpClient} from '@commercetools/platform-sdk';
import {UNIT} from "./typeDeclarations/unit";
import {MATERIAL_LINING_FEATURE} from "./typeDeclarations/materialLining";
import {MATERIAL_FILLING_FEATURE} from "./typeDeclarations/materialFilling";
import {MATERIAL_OUTER_FABRIC_FEATURE} from "./typeDeclarations/materialOuterFabric";

const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({projectKey: 'ocm'});

// First, let's create the product type "Shirt"
async function createShirtProductType() {
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
        const materialType = await apiRoot.productTypes().post({
            body: {
                name: "MaterialAttributeType",
                description: "Nested type for material attributes",
                attributes: [
                    {
                        name: "material-outer-fabric-1",
                        label: { de: "Obermaterial 1", en: "Outer Fabric 1" },
                        isRequired: false,
                        name: "material-outer-fabric",
                        label: { de: "Obermaterial", en: "Outer Fabric" },
                        isRequired: false,
                        type: MATERIAL_OUTER_FABRIC_FEATURE,
                        attributeConstraint: "None",
                        isSearchable: true
                    },
                    {
                        name: "material-lining",
                        label: { de: "Futtermaterial", en: "Lining Material" },
                        isRequired: false,
                        type: MATERIAL_LINING_FEATURE,
                        attributeConstraint: "None",
                        isSearchable: true
                    },
                    {
                        name: "material-filling",
                        label: { de: "Füllmaterial", en: "Filling Material" },
                        isRequired: false,
                        type: MATERIAL_FILLING_FEATURE,
                        attributeConstraint: "None",
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
                        type: UNIT,
                        attributeConstraint: "None",
                        isRequired: true,
                        isSearchable: true
                    }
                ]
            }
        }).execute();
        console.log('Material attribute type created:', materialType.body.id);

        // Now create the main product type with reference to the material type

        console.log('Creating Shirt product type...');
        const productType = await apiRoot.productTypes().post({
            body: {
                ...productTypeDraft,
                attributes: [
                    {
                        name: "Obermaterial",
                        label: {
                            en: "Upper Material",
                            de: "Obermaterial"
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
                        name: "Futter1",
                        label: {
                            en: "Lining",
                            de: "Futter"
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
            }
        }).execute();
        console.log('Shirt product type created successfully:', productType.body.id);

        return productType.body;
    } catch (error) {
        console.error('Error creating product type:', error);
        throw error;
    }
}

// Create a test product with the specified values
async function createTestProduct(productTypeId: string) {
    try {
        console.log('Creating test product...');
        const product = await apiRoot.products().post({
            body: {
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
                                [
                                    {
                                        name: "materialName",
                                        value: "KAMEL"
                                    },
                                    {
                                        name: "fraction",
                                        value: 50
                                    },
                                    {
                                        name: "unit",
                                        value: "percent"
                                    }
                                ],
                                [
                                    {
                                        name: "materialName",
                                        value: "KASCHGORA"
                                    },
                                    {
                                        name: "fraction",
                                        value: 50
                                    },
                                    {
                                        name: "unit",
                                        value: "percent"
                                    }
                                ]
                            ]
                        },
                        {
                            name: "Futter1",
                            value: [
                                [
                                    {
                                        name: "materialName",
                                        value: "BIBER"
                                    },
                                    {
                                        name: "fraction",
                                        value: 100
                                    },
                                    {
                                        name: "unit",
                                        value: "percent"
                                    }
                                ]
                            ]
                        }
                    ]
                },
                variants: []
            }
        }).execute();
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
        const product = await createTestProduct('0421da7e-db7a-432c-ab5e-3192c955ce3b');

        console.log('All operations completed successfully!');
        // console.log('Product ID:', product.id);

    } catch (error) {
        console.error('Main execution error:', error);
    }
}

// Run the main function
main().catch(console.error);

