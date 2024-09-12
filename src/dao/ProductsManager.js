import Product from '../models/Product.js'; 

class ProductsManager {
    // Obtener todos los productos con paginación, filtros y ordenamientos
    static async getProducts(filters = {}, sortOptions = {}, limit = 10, page = 1) {
        try {
            const totalProducts = await Product.countDocuments(filters);
            const products = await Product.find(filters)
                .sort(sortOptions)
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit));

            return {
                products,
                totalPages: Math.ceil(totalProducts / parseInt(limit)),
                currentPage: parseInt(page)
            };
        } catch (error) {
            console.error('Error getting products:', error.message);
            throw error;
        }
    }

    // Obtener un producto por ID
    static async getProductById(productId) {
        try {
            return await Product.findById(productId);
        } catch (error) {
            console.error('Error getting product by ID:', error.message);
            throw error;
        }
    }

    // Agregar un nuevo producto
    static async addProduct(product) {
        try {
            const newProduct = new Product(product);
            return await newProduct.save();
        } catch (error) {
            console.error('Error adding product:', error.message);
            throw error;
        }
    }

    // Actualizar un producto por ID
    static async updateProduct(productId, updatedProduct) {
        try {
            return await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });
        } catch (error) {
            console.error('Error updating product:', error.message);
            throw error;
        }
    }

    // Eliminar un producto por ID
    static async deleteProduct(productId) {
        try {
            return await Product.findByIdAndDelete(productId);
        } catch (error) {
            console.error('Error deleting product:', error.message);
            throw error;
        }
    }
}

export default ProductsManager;
