import {ctpClient} from "./client";

import {createApiBuilderFromCtpClient,} from '@commercetools/platform-sdk';

// Create apiRoot from the imported ClientBuilder and include your Project key
const apiRoot = createApiBuilderFromCtpClient(ctpClient)
    .withProjectKey({projectKey: 'ocm'});

// Example call to return Project information
// This code has the same effect as sending a GET request to the commercetools Composable Commerce API without any endpoints.

const getMaterialTypeId = async () => {
    const key = "material-information";
    const existingTypeResponse = await apiRoot.productTypes()
        .get({queryArgs: {where: `key="${key}"`}})
        .execute();

    if (existingTypeResponse.body.count > 0) {
        console.log("Material Type already exists with ID: " + existingTypeResponse.body.results[0].id);
        return existingTypeResponse.body.results[0].id;
    }
    const response = await apiRoot.productTypes()
        .post({
            body: {
                name: "material-information",
                key: "material-information",
                description: "The material-information type.",
                attributes: [
                    {
                        name: "material",
                        type: {name: "ltext"},
                        isRequired: true,
                        attributeConstraint: "None",
                        isSearchable: false,
                        label: {"de": "Material"}
                    },
                    {
                        name: "fraction",
                        type: {name: "number"},
                        isRequired: false,
                        attributeConstraint: "None",
                        isSearchable: false,
                        label: {"de": "Fraktion"}
                    },
                    {
                        name: "unit",
                        type: {
                            name: "lenum", values: [
                                {
                                    key: "kg",
                                    label: {"de": "Kilogramm"}
                                },
                                {
                                    key: "g",
                                    label: {"de": "Gramm"}
                                },
                                {
                                    key: "mg",
                                    label: {"de": "Milligramm"}
                                },
                                {
                                    key: "l",
                                    label: {"de": "Liter"}
                                },
                                {
                                    key: "ml",
                                    label: {"de": "Milliliter"}
                                },
                                {
                                    key: "%",
                                    label: {"de": "Prozent"}
                                }
                            ]
                        },
                        isRequired: true,
                        attributeConstraint: "None",
                        isSearchable: false,
                        label: {"de": "Einheit"}
                    },
                ]
            }
        })
        .execute();

    let id = response.body.id;
    console.log("Material Type ID: " + id);
    return id;
}

async function declareTypes() {
    const materialTypeId = await getMaterialTypeId();
    const materialGroupType = apiRoot.productTypes()
        .post({
            body: {
                name: "material-group-information",
                key: "material-group-information",
                description: "The material-group-information type.",
                attributes: [
                    {
                        name: "groupName",
                        type: {name: "ltext"},
                        isRequired: true,
                        attributeConstraint: "None",
                        isSearchable: false,
                        label: {"de": "Material Gruppe"}
                    },
                    {
                        name: "materials",
                        type: {
                            name: "set",
                            elementType: {
                                name: "nested",
                                typeReference: {
                                    id: materialTypeId,
                                    typeId: "product-type"
                                }
                            }
                        },
                        isRequired: false,
                        attributeConstraint: "None",
                        isSearchable: false,
                        label: {"de": "Materialien"}
                    }

                ]
            }
        })
        .execute()
        .then(function ({body}) {
            console.log(JSON.stringify(body));
        });
}

const updateProductType = async (key: string, version: number) => {
    const response = await apiRoot
        .productTypes()
        .withKey({key: key})
        .post({
            body: {
                version: version,
                actions: [
                    {
                        action: "addAttributeDefinition",
                        attribute: {
                            name: "materialGroup",
                            type: {
                                name: "nested",
                                typeReference: {
                                    id: '4cc58314-141f-494e-bcd2-f427a0fac300',
                                    typeId: "product-type"
                                }
                            },
                            isRequired: true,
                            attributeConstraint: "None",
                            isSearchable: false,
                            label: {"de": "Material"}
                        }
                    }
                ]
            }
        })
        .execute();
    return response.body;
};

const createProductWithCorrectMaterialGroup = async () => {
    try {
        const productTypeResponse = await apiRoot.productTypes()
            .get({queryArgs: {where: `key="base-product"`}})
            .execute();

        const productTypeId = productTypeResponse.body.results[0].id;

        // Create product with correct material-group-information structure
        const productResponse = await apiRoot.products()
            .post({
                body: {
                    productType: {
                        id: productTypeId,
                        typeId: "product-type"
                    },
                    name: {
                        "en": "Product with Correct Material Group",
                        "de": "Produkt mit korrekter Materialgruppe"
                    },
                    slug: {
                        "en": "correct-material-group-" + Date.now(),
                        "de": "korrekte-materialgruppe-" + Date.now()
                    },
                    masterVariant: {
                        sku: "CORRECT-MAT-" + Date.now(),
                        attributes: [
                            {
                                name: "materialGroup",
                                value: {
                                    // These are the fields from material-group-information type
                                    name: {
                                        "en": "Material Group Name",
                                        "de": "Materialgruppen-Name"
                                    },
                                    groupName: {
                                        "en": "Textile Materials",
                                        "de": "Textilmaterialien"
                                    },
                                    materials: [
                                        {
                                            // These are the fields from material-information type
                                            material: {
                                                "en": "Upper - Polyamide",
                                                "de": "Obermaterial - Polyamid"
                                            },
                                            unit: "%" // This is required and must be one of the enum values
                                            // fraction is optional, so we can skip it
                                        },
                                        {
                                            material: {
                                                "en": "Lining - Cotton",
                                                "de": "Futter - Baumwolle"
                                            },
                                            fraction: 85,
                                            unit: "%"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            })
            .execute();

        console.log("Product with correct material group created successfully!");
        console.log("Product ID:", productResponse.body.id);

        // Let's see the created structure
        const masterVariant = productResponse.body.masterData.current.masterVariant;
        const materialGroupAttr = masterVariant.attributes?.find(attr => attr.name === 'materialGroup');
        console.log("Created materialGroup structure:", JSON.stringify(materialGroupAttr?.value, null, 2));

        return productResponse.body;

    } catch (error) {
        console.error("Error creating product with correct material group:", error);
        throw error;
    }
}

// Let's also try with minimal required fields only
const createProductWithMinimalMaterialGroup = async () => {
    try {
        const productTypeResponse = await apiRoot.productTypes()
            .get({queryArgs: {where: `key="base-product"`}})
            .execute();

        const productTypeId = productTypeResponse.body.results[0].id;

        const productResponse = await apiRoot.products()
            .post({
                body: {
                    productType: {
                        id: "4cc58314-141f-494e-bcd2-f427a0fac300", // material-group-information type ID
                        typeId: "product-type"
                    },
                    name: {
                        "en": "Direct Material Group Product",
                        "de": "Direktes Materialgruppen-Produkt"
                    },
                    slug: {
                        "en": "direct-material-group-" + Date.now(),
                        "de": "direktes-materialgruppe-" + Date.now()
                    },
                    masterVariant: {
                        sku: "DIRECT-MAT-" + Date.now(),
                        attributes: [
                            {
                                name: "name",
                                value: {
                                    "en": "Material Group Info",
                                    "de": "Materialgruppen-Info"
                                }
                            },
                            {
                                name: "groupName",
                                value: {
                                    "en": "Textile Materials",
                                    "de": "Textilmaterialien"
                                }
                            }
                        ]
                    }
                }
            })
            .execute();


        console.log("Minimal material group product created successfully!");
        console.log("Product ID:", productResponse.body.id);

        return productResponse.body;

    } catch (error) {
        console.error("Error creating minimal material group product:", error);
        throw error;
    }
}


createProductWithMinimalMaterialGroup();
// createProductWithCorrectMaterialGroup();
