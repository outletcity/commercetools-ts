import {ctpClient} from "./client";
import {createApiBuilderFromCtpClient} from '@commercetools/platform-sdk';
import {CategoryService} from "./category_service";
import {ProductService} from './product-service';

// Product data for different categories
const productTemplates = {
    tops: [
        {name: "Cotton Basic Tee", brand: "Essentials", basePrice: 1599},
        {name: "Silk Blouse", brand: "Luxury Line", basePrice: 8999},
        {name: "Striped Long Sleeve", brand: "Casual Wear", basePrice: 2499},
        {name: "V-Neck Sweater", brand: "Cozy Knits", basePrice: 4599},
        {name: "Cropped Tank Top", brand: "Summer Vibes", basePrice: 1299}
    ],
    dresses: [
        {name: "Maxi Dress", brand: "Elegant Style", basePrice: 7999},
        {name: "Little Black Dress", brand: "Classic Collection", basePrice: 9999},
        {name: "Floral Midi Dress", brand: "Spring Fashion", basePrice: 5999},
        {name: "Wrap Dress", brand: "Versatile Wear", basePrice: 6499},
        {name: "Evening Gown", brand: "Formal Affairs", basePrice: 15999}
    ],
    pants: [
        {name: "High-Waisted Trousers", brand: "Professional", basePrice: 6999},
        {name: "Wide Leg Pants", brand: "Comfortable Fit", basePrice: 5499},
        {name: "Skinny Jeans", brand: "Denim Co", basePrice: 4999},
        {name: "Yoga Leggings", brand: "Active Life", basePrice: 3499},
        {name: "Palazzo Pants", brand: "Boho Chic", basePrice: 4599}
    ],
    jackets: [
        {name: "Blazer", brand: "Business Attire", basePrice: 12999},
        {name: "Denim Jacket", brand: "Casual Classic", basePrice: 6999},
        {name: "Leather Jacket", brand: "Edgy Style", basePrice: 19999},
        {name: "Cardigan", brand: "Soft Layers", basePrice: 5999},
        {name: "Bomber Jacket", brand: "Street Style", basePrice: 8999}
    ],
    shoes: [
        {name: "High Heels", brand: "Glamour Shoes", basePrice: 8999},
        {name: "Ballet Flats", brand: "Comfort Walk", basePrice: 4999},
        {name: "Ankle Boots", brand: "Urban Steps", basePrice: 11999},
        {name: "Sneakers", brand: "Sport Comfort", basePrice: 7999},
        {name: "Sandals", brand: "Summer Feet", basePrice: 3999}
    ],
    accessories: [
        {name: "Leather Handbag", brand: "Luxury Bags", basePrice: 24999},
        {name: "Gold Necklace", brand: "Fine Jewelry", basePrice: 12999},
        {name: "Silk Scarf", brand: "Elegant Touch", basePrice: 6999},
        {name: "Leather Belt", brand: "Quality Leather", basePrice: 4999},
        {name: "Sunglasses", brand: "Eye Protection", basePrice: 8999}
    ],
    lingerie: [
        {name: "Push-up Bra", brand: "Intimate Comfort", basePrice: 3999},
        {name: "Lace Panties", brand: "Delicate Lace", basePrice: 1999},
        {name: "Silk Pajamas", brand: "Night Comfort", basePrice: 8999},
        {name: "Sports Bra", brand: "Active Support", basePrice: 2999},
        {name: "Lingerie Set", brand: "Romantic Collection", basePrice: 7999}
    ],
    activewear: [
        {name: "Yoga Top", brand: "Zen Fitness", basePrice: 3499},
        {name: "Running Leggings", brand: "Marathon Ready", basePrice: 4999},
        {name: "Sports Bra", brand: "High Performance", basePrice: 3999},
        {name: "Workout Set", brand: "Gym Fashion", basePrice: 7999},
        {name: "Athletic Shorts", brand: "Active Wear", basePrice: 2999}
    ]
};

const colors = ['red', 'blue', 'green'];
const sizes = ['XS', 'S', 'M', 'L', 'XL'];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomSize() {
    return sizes[Math.floor(Math.random() * sizes.length)];
}

function generateVariations(basePrice: number) {
    return [
        {size: 'S', color: 'red', price: basePrice},
        {size: 'M', color: 'blue', price: basePrice + 500},
        {size: 'L', color: 'green', price: basePrice + 1000}
    ];
}

async function create50WomensProducts() {
    const categoryService = new CategoryService();
    const productService = new ProductService("3e3f5ac3-6cb4-4b93-a259-82422706df61"); // Replace with actual product type ID

    try {
        // First, get all the category IDs we need
        console.log('Fetching category IDs...');
        const womenTops = await categoryService.getCategoryByKey("women-tops");
        const womenDresses = await categoryService.getCategoryByKey("women-dresses");
        const womenPants = await categoryService.getCategoryByKey("women-pants");
        const womenJackets = await categoryService.getCategoryByKey("women-jackets");
        const womenShoes = await categoryService.getCategoryByKey("women-shoes");
        const womenAccessories = await categoryService.getCategoryByKey("women-accessories");
        const womenLingerie = await categoryService.getCategoryByKey("women-lingerie");
        const womenActivewear = await categoryService.getCategoryByKey("women-activewear");

        const categoryMappings = {
            tops: [womenTops.id],
            dresses: [womenDresses.id],
            pants: [womenPants.id],
            jackets: [womenJackets.id],
            shoes: [womenShoes.id],
            accessories: [womenAccessories.id],
            lingerie: [womenLingerie.id],
            activewear: [womenActivewear.id]
        };

        const createdProducts = [];
        let productCounter = 1;

        // Create products for each category
        for (const [categoryKey, products] of Object.entries(productTemplates)) {
            console.log(`Creating ${categoryKey} products...`);

            for (const product of products) {
                try {
                    const styleCode = `women-${categoryKey}-${productCounter.toString().padStart(3, '0')}`;
                    const productName = `${product.name} - Women's`;

                    const createdProduct = await productService.createSimpleProduct(
                        styleCode,
                        productName,
                        product.brand,
                        categoryMappings[categoryKey as keyof typeof categoryMappings]
                    );

                    createdProducts.push({
                        id: createdProduct.id,
                        name: productName,
                        category: categoryKey,
                        styleCode: styleCode
                    });

                    console.log(`✅ Created product ${productCounter}: ${productName}`);
                    productCounter++;

                    // Add a small delay to avoid overwhelming the API
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`❌ Error creating product ${product.name}:`, error);
                }
            }
        }

        // Create additional products to reach 50
        const additionalProducts = [
            {name: "Cashmere Sweater", brand: "Luxury Knits", category: "tops", basePrice: 19999},
            {name: "Cocktail Dress", brand: "Party Ready", category: "dresses", basePrice: 12999},
            {name: "Cargo Pants", brand: "Utility Fashion", category: "pants", basePrice: 6999},
            {name: "Trench Coat", brand: "Classic Outerwear", category: "jackets", basePrice: 24999},
            {name: "Platform Heels", brand: "Statement Shoes", basePrice: 9999},
            {name: "Designer Watch", brand: "Time Luxury", category: "accessories", basePrice: 34999},
            {name: "Silk Nightgown", brand: "Sleepwear Elegance", category: "lingerie", basePrice: 14999},
            {name: "Compression Tights", brand: "Performance Gear", category: "activewear", basePrice: 6999},
            {name: "Peasant Blouse", brand: "Boho Style", category: "tops", basePrice: 4999},
            {name: "Pencil Skirt", brand: "Office Chic", category: "pants", basePrice: 5999}
        ];

        for (const product of additionalProducts) {
            try {
                const styleCode = `women-${product.category}-${productCounter.toString().padStart(3, '0')}`;
                const productName = `${product.name} - Women's`;

                const createdProduct = await productService.createSimpleProduct(
                    styleCode,
                    productName,
                    product.brand,
                    categoryMappings[product.category as keyof typeof categoryMappings]
                );

                createdProducts.push({
                    id: createdProduct.id,
                    name: productName,
                    category: product.category,
                    styleCode: styleCode
                });

                console.log(`✅ Created product ${productCounter}: ${productName}`);
                productCounter++;

                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`❌ Error creating additional product ${product.name}:`, error);
            }
        }

        console.log('\n🎉 Product creation completed!');
        console.log(`📊 Total products created: ${createdProducts.length}`);
        console.log('\n📋 Summary by category:');

        const summary = createdProducts.reduce((acc, product) => {
            // @ts-ignore
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(summary).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} products`);
        });

        return createdProducts;

    } catch (error) {
        console.error('Error in bulk product creation:', error);
        throw error;
    }
}

// Execute the function
async function runProductCreation() {
    try {
        console.log('🚀 Starting bulk product creation for women\'s categories...\n');
        const products = await create50WomensProducts();
        console.log('\n✅ All products created successfully!');
        return products;
    } catch (error) {
        console.error('❌ Failed to create products:', error);
    }
}

export const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({projectKey: 'ocm'});

// Create the women's category hierarchy
async function createWomensCategoryHierarchy() {
    try {
        let categoryService = new CategoryService();

        // Use the updated method that handles recursive hierarchies
        const womenCategories = await categoryService.createCategoryHierarchy([
            {
                key: "women",
                name: {en: "Women", de: "Damen"},
                slug: {en: "women", de: "damen"},
                description: {en: "Women's clothing and accessories", de: "Damenbekleidung und Accessoires"},
                children: [
                    {
                        key: "women-clothing",
                        name: {en: "Clothing", de: "Bekleidung"},
                        slug: {en: "women-clothing", de: "damen-bekleidung"},
                        description: {en: "Women's clothing", de: "Damenbekleidung"},
                        children: [
                            {
                                key: "women-tops",
                                name: {en: "Tops", de: "Oberteile"},
                                slug: {en: "women-tops", de: "damen-oberteile"}
                            },
                            {
                                key: "women-blouses",
                                name: {en: "Blouses", de: "Blusen"},
                                slug: {en: "women-blouses", de: "damen-blusen"}
                            },
                            {
                                key: "women-shirts",
                                name: {en: "Shirts", de: "Shirts"},
                                slug: {en: "women-shirts", de: "damen-shirts"}
                            },
                            {
                                key: "women-dresses",
                                name: {en: "Dresses", de: "Kleider"},
                                slug: {en: "women-dresses", de: "damen-kleider"}
                            },
                            {
                                key: "women-skirts",
                                name: {en: "Skirts", de: "Röcke"},
                                slug: {en: "women-skirts", de: "damen-roecke"}
                            },
                            {
                                key: "women-pants",
                                name: {en: "Pants", de: "Hosen"},
                                slug: {en: "women-pants", de: "damen-hosen"}
                            },
                            {
                                key: "women-jeans",
                                name: {en: "Jeans", de: "Jeans"},
                                slug: {en: "women-jeans", de: "damen-jeans"}
                            },
                            {
                                key: "women-jackets",
                                name: {en: "Jackets", de: "Jacken"},
                                slug: {en: "women-jackets", de: "damen-jacken"}
                            },
                            {
                                key: "women-coats",
                                name: {en: "Coats", de: "Mäntel"},
                                slug: {en: "women-coats", de: "damen-maentel"}
                            },
                            {
                                key: "women-sweaters",
                                name: {en: "Sweaters", de: "Pullover"},
                                slug: {en: "women-sweaters", de: "damen-pullover"}
                            },
                            {
                                key: "women-cardigans",
                                name: {en: "Cardigans", de: "Strickjacken"},
                                slug: {en: "women-cardigans", de: "damen-strickjacken"}
                            }
                        ]
                    },
                    {
                        key: "women-shoes",
                        name: {en: "Shoes", de: "Schuhe"},
                        slug: {en: "women-shoes", de: "damen-schuhe"},
                        description: {en: "Women's footwear", de: "Damenschuhe"},
                        children: [
                            {
                                key: "women-heels",
                                name: {en: "Heels", de: "Absatzschuhe"},
                                slug: {en: "women-heels", de: "damen-absatzschuhe"}
                            },
                            {
                                key: "women-flats",
                                name: {en: "Flats", de: "Ballerinas"},
                                slug: {en: "women-flats", de: "damen-ballerinas"}
                            },
                            {
                                key: "women-sneakers",
                                name: {en: "Sneakers", de: "Sneaker"},
                                slug: {en: "women-sneakers", de: "damen-sneaker"}
                            },
                            {
                                key: "women-boots",
                                name: {en: "Boots", de: "Stiefel"},
                                slug: {en: "women-boots", de: "damen-stiefel"}
                            },
                            {
                                key: "women-sandals",
                                name: {en: "Sandals", de: "Sandalen"},
                                slug: {en: "women-sandals", de: "damen-sandalen"}
                            }
                        ]
                    },
                    {
                        key: "women-accessories",
                        name: {en: "Accessories", de: "Accessoires"},
                        slug: {en: "women-accessories", de: "damen-accessoires"},
                        description: {en: "Women's accessories", de: "Damen-Accessoires"},
                        children: [
                            {
                                key: "women-bags",
                                name: {en: "Bags", de: "Taschen"},
                                slug: {en: "women-bags", de: "damen-taschen"}
                            },
                            {
                                key: "women-jewelry",
                                name: {en: "Jewelry", de: "Schmuck"},
                                slug: {en: "women-jewelry", de: "damen-schmuck"}
                            },
                            {
                                key: "women-scarves",
                                name: {en: "Scarves", de: "Schals"},
                                slug: {en: "women-scarves", de: "damen-schals"}
                            },
                            {
                                key: "women-belts",
                                name: {en: "Belts", de: "Gürtel"},
                                slug: {en: "women-belts", de: "damen-guertel"}
                            },
                            {
                                key: "women-hats",
                                name: {en: "Hats", de: "Hüte"},
                                slug: {en: "women-hats", de: "damen-huete"}
                            },
                            {
                                key: "women-sunglasses",
                                name: {en: "Sunglasses", de: "Sonnenbrillen"},
                                slug: {en: "women-sunglasses", de: "damen-sonnenbrillen"}
                            }
                        ]
                    },
                    {
                        key: "women-lingerie",
                        name: {en: "Lingerie", de: "Unterwäsche"},
                        slug: {en: "women-lingerie", de: "damen-unterwaesche"},
                        description: {en: "Women's lingerie and underwear", de: "Damenunterwäsche und Lingerie"},
                        children: [
                            {
                                key: "women-bras",
                                name: {en: "Bras", de: "BHs"},
                                slug: {en: "women-bras", de: "damen-bhs"}
                            },
                            {
                                key: "women-panties",
                                name: {en: "Panties", de: "Slips"},
                                slug: {en: "women-panties", de: "damen-slips"}
                            },
                            {
                                key: "women-lingerie-sets",
                                name: {en: "Lingerie Sets", de: "Dessous-Sets"},
                                slug: {en: "women-lingerie-sets", de: "damen-dessous-sets"}
                            },
                            {
                                key: "women-sleepwear",
                                name: {en: "Sleepwear", de: "Nachtwäsche"},
                                slug: {en: "women-sleepwear", de: "damen-nachtwasche"}
                            }
                        ]
                    },
                    {
                        key: "women-activewear",
                        name: {en: "Activewear", de: "Sportbekleidung"},
                        slug: {en: "women-activewear", de: "damen-sportbekleidung"},
                        description: {en: "Women's sportswear and activewear", de: "Damen-Sportbekleidung"},
                        children: [
                            {
                                key: "women-sports-tops",
                                name: {en: "Sports Tops", de: "Sport-Oberteile"},
                                slug: {en: "women-sports-tops", de: "damen-sport-oberteile"}
                            },
                            {
                                key: "women-leggings",
                                name: {en: "Leggings", de: "Leggings"},
                                slug: {en: "women-leggings", de: "damen-leggings"}
                            },
                            {
                                key: "women-sports-bras",
                                name: {en: "Sports Bras", de: "Sport-BHs"},
                                slug: {en: "women-sports-bras", de: "damen-sport-bhs"}
                            },
                            {
                                key: "women-activewear-sets",
                                name: {en: "Activewear Sets", de: "Sportbekleidung-Sets"},
                                slug: {en: "women-activewear-sets", de: "damen-sportbekleidung-sets"}
                            }
                        ]
                    }
                ]
            }
        ]);

        console.log('Women\'s category hierarchy created successfully!');
        console.log(`Total categories created: ${womenCategories.length}`);
        return womenCategories;
    } catch (error) {
        console.error('Error creating women\'s category hierarchy:', error);
        throw error;
    }
}

async function main() {
    try {
// Run the script
        runProductCreation();
//         createWomensCategoryHierarchy();

    } catch (error) {
        console.error('Main execution error:', error);
    }
}

// Run the main function
main().catch(console.error);


