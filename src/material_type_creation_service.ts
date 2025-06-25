import {ctpClient} from "./client";
import {createApiBuilderFromCtpClient} from '@commercetools/platform-sdk';
import {UNIT} from "./typeDeclarations/unit";
import {MATERIAL_LINING_FEATURE} from "./typeDeclarations/materialLining";
import {MATERIAL_FILLING_FEATURE} from "./typeDeclarations/materialFilling";
import {MATERIAL_OUTER_FABRIC_FEATURE} from "./typeDeclarations/materialOuterFabric";

const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({projectKey: 'ocm'});

// Create OuterFabric Type
async function createOuterFabricType() {
    try {
        console.log('Creating OuterFabric type...');
        const outerFabricType = await apiRoot.productTypes().post({
            body: {
                name: "OuterFabricType",
                key: "outerFabricType",
                description: "Type for outer fabric material attributes",
                attributes: [
                    {
                        name: "material",
                        label: { de: "Obermaterial", en: "Outer Fabric" },
                        isRequired: false,
                        type: MATERIAL_OUTER_FABRIC_FEATURE,
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
        console.log('OuterFabric type created:', outerFabricType.body.id);
        return outerFabricType.body;
    } catch (error) {
        console.error('Error creating OuterFabric type:', error);
        throw error;
    }
}

// Create LiningMaterial Type
async function createLiningMaterialType() {
    try {
        console.log('Creating LiningMaterial type...');
        const liningMaterialType = await apiRoot.productTypes().post({
            body: {
                name: "LiningMaterialType",
                key: "liningMaterialType",
                description: "Type for lining material attributes",
                attributes: [
                    {
                        name: "material",
                        label: { de: "Futtermaterial", en: "Lining Material" },
                        isRequired: false,
                        type: MATERIAL_LINING_FEATURE,
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
        console.log('LiningMaterial type created:', liningMaterialType.body.id);
        return liningMaterialType.body;
    } catch (error) {
        console.error('Error creating LiningMaterial type:', error);
        throw error;
    }
}

// Create FillingMaterial Type
async function createFillingMaterialType() {
    try {
        console.log('Creating FillingMaterial type...');
        const fillingMaterialType = await apiRoot.productTypes().post({
            body: {
                name: "FillingMaterialType",
                key: "fillingMaterialType",
                description: "Type for filling material attributes",
                attributes: [
                    {
                        name: "material",
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
        console.log('FillingMaterial type created:', fillingMaterialType.body.id);
        return fillingMaterialType.body;
    } catch (error) {
        console.error('Error creating FillingMaterial type:', error);
        throw error;
    }
}

// Create all three types
async function createAllMaterialTypes() {
    try {
        console.log('Creating all material types...');
        
        const outerFabricType = await createOuterFabricType();
        const liningMaterialType = await createLiningMaterialType();
        const fillingMaterialType = await createFillingMaterialType();
        
        console.log('All material types created successfully!');
        
        return {
            outerFabricType,
            liningMaterialType,
            fillingMaterialType
        };
    } catch (error) {
        console.error('Error creating material types:', error);
        throw error;
    }
}

// Export the function to be used in your main file
export { createAllMaterialTypes, createOuterFabricType, createLiningMaterialType, createFillingMaterialType };