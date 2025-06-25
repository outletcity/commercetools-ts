import { apiRoot } from "./main";

export class CategoryService {
    
    constructor() {
        // No specific initialization needed for categories
    }

    async createCategory(
        key: string,
        name: string | { [locale: string]: string },
        slug: string | { [locale: string]: string },
        description?: string | { [locale: string]: string },
        parentCategoryId?: string,
        orderHint?: string
    ) {
        try {
            console.log('Creating category...');
            
            // Ensure name and slug are in the correct format
            const categoryName = typeof name === 'string' 
                ? { en: name } 
                : name;
                
            const categorySlug = typeof slug === 'string' 
                ? { en: slug } 
                : slug;

            const categoryDescription = description 
                ? (typeof description === 'string' ? { en: description } : description)
                : undefined;

            const categoryData: any = {
                key,
                name: categoryName,
                slug: categorySlug,
                ...(categoryDescription && { description: categoryDescription }),
                ...(orderHint && { orderHint })
            };

            // Add parent category reference if provided
            if (parentCategoryId) {
                categoryData.parent = {
                    typeId: "category",
                    id: parentCategoryId
                };
            }

            const category = await apiRoot.categories().post({
                body: categoryData
            }).execute();

            console.log('Category created successfully:', category.body.id);
            return category.body;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    async createTestCategory(
        key: string = "test-category",
        name: string = "Test Category",
        slug: string = "test-category"
    ) {
        return this.createCategory(key, name, slug, "A test category for development purposes");
    }

    async getCategoryByKey(key: string) {
        try {
            const category = await apiRoot.categories().withKey({ key }).get().execute();
            return category.body;
        } catch (error) {
            console.error('Error fetching category by key:', error);
            throw error;
        }
    }

    async getCategoryById(id: string) {
        try {
            const category = await apiRoot.categories().withId({ ID: id }).get().execute();
            return category.body;
        } catch (error) {
            console.error('Error fetching category by ID:', error);
            throw error;
        }
    }

    async getAllCategories() {
        try {
            const categories = await apiRoot.categories().get().execute();
            return categories.body.results;
        } catch (error) {
            console.error('Error fetching all categories:', error);
            throw error;
        }
    }


    async createCategoryHierarchy(categories: Array<{
        key: string;
        name: string | { [locale: string]: string };
        slug: string | { [locale: string]: string };
        description?: string | { [locale: string]: string };
        children?: Array<any>;
    }>) {
        const createdCategories: any[] = [];

        // Recursive function to create categories and their children
        const createCategoryRecursively = async (categoryData: any, parentId?: string) => {
            try {
                const category = await this.createCategory(
                    categoryData.key,
                    categoryData.name,
                    categoryData.slug,
                    categoryData.description,
                    parentId
                );
                createdCategories.push(category);

                // Create child categories recursively if they exist
                if (categoryData.children && categoryData.children.length > 0) {
                    for (const childData of categoryData.children) {
                        await createCategoryRecursively(childData, category.id);
                    }
                }

                return category;
            } catch (error) {
                console.error(`Error creating category ${categoryData.key}:`, error);
                throw error;
            }
        };

        // Create all top-level categories and their hierarchies
        for (const categoryData of categories) {
            await createCategoryRecursively(categoryData);
        }

        return createdCategories;
    }
}