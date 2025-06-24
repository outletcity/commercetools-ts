import {ctpClient} from "./client";
import {createApiBuilderFromCtpClient} from '@commercetools/platform-sdk';
import {createAllMaterialTypes} from "./material_type_creation_service";
import {outerFabricKeys} from "./typeDeclarations/materialOuterFabric";
import {MATERIAL_VALUES} from "./typeDeclarations/materialValues";
import {fetchProductBySku} from "./fetchProductBySkuService";

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
        let typeIds = await createAllMaterialTypes();
        // Now create the main product type with reference to the material type

        console.log('Creating Shirt product type...');
        const productType = await apiRoot.productTypes().post({
            body: {
                ...productTypeDraft,
                attributes: [
                    {
                        name: "outer-fabric1",
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
                                    id: typeIds.outerFabricType.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "outer-fabric2",
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
                                    id: typeIds.outerFabricType.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "outer-fabric3",
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
                                    id: typeIds.outerFabricType.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "outer-fabric4",
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
                                    id: typeIds.outerFabricType.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "lining1",
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
                                    id: typeIds.liningMaterialType.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "lining2",
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
                                    id: typeIds.liningMaterialType.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "lining3",
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
                                    id: typeIds.liningMaterialType.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "filling1",
                        label: {
                            en: "Filling",
                            de: "Füllung"
                        },
                        type: {
                            name: "set",
                            elementType: {
                                name: "nested",
                                typeReference: {
                                    typeId: "product-type",
                                    id: typeIds.fillingMaterialType.id
                                }
                            }
                        },
                        attributeConstraint: "None",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "filling2",
                        label: {
                            en: "Filling",
                            de: "Füllung"
                        },
                        type: {
                            name: "set",
                            elementType: {
                                name: "nested",
                                typeReference: {
                                    typeId: "product-type",
                                    id: typeIds.fillingMaterialType.id
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
async function createTestProduct(productTypeId: string, slug: string = "test-shirt") {
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
                    en: slug
                },
                masterVariant: {
                    sku: slug,
                    attributes: [
                        {
                            name: "outer-fabric1",
                            value: [
                                [
                                    {
                                        name: "material",
                                        value: MATERIAL_VALUES.KAMEL.key
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
                                        name: "material",
                                        value: MATERIAL_VALUES.KASCHGORA.key
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
                            name: "outer-fabric2",
                            value: [
                                [
                                    {
                                        name: "material",
                                        value: MATERIAL_VALUES.HENEQUEN.key
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
                        },

                        {
                            name: "lining1",
                            value: [
                                [
                                    {
                                        name: "material",
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
async function createClothingAttributeGroups() {
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
    }
    catch (error) {
        console.error('Error creating clothing attribute groups:', error);
        throw error;
    }
}

async function main() {
    try {
        // createTestProduct('fc1396ad-2fb5-452a-bf9f-7a3c7e611f82', 'test-shirt-002');
       fetchProductBySku('test-shirt-002');

    } catch (error) {
        console.error('Main execution error:', error);
    }
}

// Run the main function
main().catch(console.error);



