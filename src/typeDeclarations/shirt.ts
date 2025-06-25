import {createAllMaterialTypes} from "../material_type_creation_service";
import {apiRoot} from "../main";

export async function createShirtProductType() {
    try {
        // First create the nested type for materials

        console.log('Creating material attribute type...');
        // Now create the main product type with reference to the material type
        const benefitsProductType = await apiRoot.productTypes().post({
            body: {
                name: "Benefits",
                description: "Product type for benefits",
                key: "benefits-product-type",
                attributes: [
                    {
                        name: "code",
                        label: {
                            en: "Code",
                            de: "Code"
                        },
                        type: {
                            name: "text"
                        },
                        attributeConstraint: "Unique",
                        isRequired: true,
                        isSearchable: false
                    },
                    {
                        name: "name",
                        label: {
                            en: "Name",
                            de: "Name"
                        },
                        type: {
                            name: "ltext"
                        },
                        attributeConstraint: "None",
                        isRequired: true,
                        isSearchable: false
                    },
                    {
                        name: "imageUrl",
                        label: {
                            en: "Image URL",
                            de: "Bild-URL"
                        },
                        type: {
                            name: "text"
                        },
                        attributeConstraint: "None",
                        isRequired: true,
                        isSearchable: false
                    }
                ]
            }
        }).execute();

        let typeIds = await createAllMaterialTypes();
        console.log('Creating Shirt product type...');
        const productType = await apiRoot.productTypes().post({
            body: {
                name: "Shirt",
                description: "Product type for shirt items",
                key: "shirt-product-type",
                attributes: [
                    //create attribute display-name which is a localized text
                    {
                        name: "brand-name",
                        label: {
                            en: "Brand Name",
                            de: "Markenname"
                        },
                        type: {
                            name: "text"
                        },
                        attributeConstraint: "SameForAll",
                        isRequired: true,
                        isSearchable: true
                    },
                    //create me an attribute product benefit which is a reference to the benefits product type, as a set
                    {
                        name: "product-benefit",
                        label: {
                            en: "Product Benefit",
                            de: "Produktnutzen"
                        },
                        type: {
                            name: "set",
                            elementType: {
                                name: "nested",
                                typeReference: {
                                    typeId: "product-type",
                                    id: benefitsProductType.body.id
                                }
                            }
                        },
                        attributeConstraint: "SameForAll",
                        isRequired: false,
                        isSearchable: true
                    },
                    {
                        name: "display-color",
                        label: {
                            en: "Color",
                            de: "Farbe"
                        },
                        type: {
                            name: "ltext"
                        },
                        attributeConstraint: "None",
                        isRequired: true,
                        isSearchable: false
                    },
                    //create an attribute named color which is an enum with values "red", "blue", "green", in one language
                    {
                        name: "color",
                        label: {
                            en: "Color",
                            de: "Farbe"
                        },
                        type: {
                            name: "enum",
                            values: [
                                {key: "red", label: "Red"},
                                {key: "blue", label: "Blue"},
                                {key: "green", label: "Green"}
                            ]
                        },
                        attributeConstraint: "CombinationUnique",
                        isRequired: true,
                        isSearchable: true
                    },
                    //create an attribute for size as text
                    {
                        name: "size",
                        label: {
                            en: "Size",
                            de: "Größe"
                        },
                        type: {
                            name: "text"
                        },
                        attributeConstraint: "CombinationUnique",
                        isRequired: true,
                        isSearchable: true
                    },
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
                        attributeConstraint: "SameForAll",
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
                        attributeConstraint: "SameForAll",
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
                        attributeConstraint: "SameForAll",
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
                        attributeConstraint: "SameForAll",
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
                        attributeConstraint: "SameForAll",
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
                        attributeConstraint: "SameForAll",
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
                        attributeConstraint: "SameForAll",
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
                        attributeConstraint: "SameForAll",
                        isRequired: false,
                        isSearchable: true
                    }
                ]
            }
        }).execute();

        console.log('Shirt product type created successfully:', productType.body.id);
        //create me a new product type called "benefits" with the following attributes:
        //code, name, imageUrl
        return productType.body;
    } catch (error) {
        console.error('Error creating product type:', error);
        throw error;
    }
}