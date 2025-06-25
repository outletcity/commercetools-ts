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
            },
            {
                name: "product-benefit",
                value: [
                    [
                        {
                            name: "code",
                            value: "water-resistant"
                        },
                        {
                            name: "name",
                            value: {
                                "en": "Water Resistant",
                                "de": "Wasserabweisend"
                            }
                        },
                        {
                            name: "imageUrl",
                            value: "https://example.com/images/water-resistant.png"
                        }
                    ]
                ]
            }
        ];
    }

    //add brandname to the method
    async createTestProduct(styleCode: string = "test-shirt", name: string = "Test shirt", brandName: string = "Test Brand") {
        try {
            console.log('Creating test product...');
            const product = await apiRoot.products().post({
                body: {
                    name: {
                        en: name,
                    },
                    productType: {
                        typeId: "product-type",
                        id: this.productTypeId
                    },
                    key: styleCode,
                    slug: {
                        en: styleCode
                    },
                    masterVariant: {
                        images: [
                            {
                                url: "https://outletcity.freetls.fastly.net/medias/sys_master/noidx/noidx/h34/hdc/9820870737950/4058213070309-br-1280x1920-1.jpg?width=382",
                                dimensions: {
                                    w: 382,
                                    h: 573
                                }
                            }
                        ],
                        sku: styleCode + "-1",
                        attributes: [
                            ...this.getCommonAttributes(brandName),
                            {
                                name: "size",
                                value: "L"
                            },
                            {
                                name: "color",
                                value: "blue"
                            },
                            {
                                name: "display-color",
                                value: {
                                    "en": "Blue",
                                    "de": "Blau"
                                }
                            }
                        ],
                        prices: [
                            {
                                value: {
                                    currencyCode: "EUR",
                                    centAmount: 1999,
                                },
                            }
                        ],
                    },
                    variants: [
                        {
                            sku: styleCode + "-2",
                            attributes: [
                                ...this.getCommonAttributes(brandName),
                                {
                                    name: "size",
                                    value: "M"
                                },
                                {
                                    name: "color",
                                    value: "red"
                                },
                                {
                                    name: "display-color",
                                    value: {
                                        "en": "Red",
                                        "de": "Rot"
                                    }
                                },
                            ],
                            prices: [
                                {
                                    value: {
                                        currencyCode: "EUR",
                                        centAmount: 2999
                                    }
                                }
                            ],
                        },
                        {
                            sku: styleCode + "-3",
                            attributes: [
                                ...this.getCommonAttributes(brandName),
                                {
                                    name: "size",
                                    value: "L"
                                },
                                {
                                    name: "color",
                                    value: "red"
                                },
                                {
                                    name: "display-color",
                                    value: {
                                        "en": "Red",
                                        "de": "Rot"
                                    }
                                },
                            ],
                            prices: [
                                {
                                    value: {
                                        currencyCode: "EUR",
                                        centAmount: 2999
                                    }
                                }
                            ],
                        },
                        {
                            sku: styleCode + "-4",
                            attributes: [
                                ...this.getCommonAttributes(brandName),
                                {
                                    name: "size",
                                    value: "XL"
                                },
                                {
                                    name: "color",
                                    value: "red"
                                },
                                {
                                    name: "display-color",
                                    value: {
                                        "en": "Red",
                                        "de": "Rot"
                                    }
                                },

                            ],
                            prices: [
                                {
                                    value: {
                                        currencyCode: "EUR",
                                        centAmount: 2999
                                    }
                                }
                            ],
                        }
                    ]
                }
            }).execute();
            console.log('Test product created successfully:', product.body.id);

            return product.body;
        } catch (error) {
            console.dir(error, {depth: null});
            throw error;
        }
    }

}