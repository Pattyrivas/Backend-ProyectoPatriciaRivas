import { Product } from './models/Product.js';

export class ProductsManager {
    // Obtener productos con paginación y filtros
    static async getProducts(limit = 10, page = 1, query, sort) {
        try {
            const filter = query
                ? {
                    $expr: {
                        $eq: [{ $toLower: "$category" }, query.toLowerCase()], 
                    },
                }
                : {};

            const sorting = sort ? { price: sort === "asc" ? 1 : -1 } : {};

            const response = await Product.paginate(filter, {
                lean: true,
                limit,
                page,
                sort: sorting,
            });

            return {
                status: response ? "success" : "error",
                payload: response.docs,
                totalPages: response.totalPages,
                prevPage: response.prevPage,
                nextPage: response.nextPage,
                page: response.page,
                hasPrevPage: response.hasPrevPage,
                hasNextPage: response.hasNextPage,
                prevLink: response.hasPrevPage
                    ? `/api/products?limit=${limit}&page=${response.prevPage}`
                    : null,
                nextLink: response.hasNextPage
                    ? `/api/products?limit=${limit}&page=${response.nextPage}`
                    : null,
            };
        } catch (error) {
            console.error("Error al obtener productos:", error);
            throw new Error("No se pudieron obtener los productos.");
        }
    }

    // Verificar la existencia de un producto por ID
    static async pidVerify(productId) {
        try {
            return await Product.findById(productId);
        } catch (error) {
            console.error("Error al verificar el producto:", error);
            throw new Error("Producto no encontrado.");
        }
    }

    // Obtener un producto por su ID
    static async getProductsById(productId) {
        try {
            const product = await Product.findOne({ _id: productId }).lean();
            if (!product) throw new Error("Producto no encontrado.");
            return product;
        } catch (error) {
            console.error("Error al obtener el producto:", error);
            throw new Error("Error al obtener el producto por ID.");
        }
    }

    // Agregar un nuevo producto
    static async addProduct(newProduct) {
        try {
            await Product.create(newProduct);
        } catch (error) {
            console.error("Error al agregar el producto:", error);
            throw new Error("No se pudo agregar el producto.");
        }
    }

    // Eliminar un producto por ID
    static async deleteProduct(productId) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(productId);
            if (!deletedProduct) throw new Error("Producto no encontrado.");
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            throw new Error("No se pudo eliminar el producto.");
        }
    }

    // Actualizar un producto por ID
    static async updateProduct(updatedProduct, productId) {
        try {
            const result = await Product.findByIdAndUpdate(
                productId,
                updatedProduct,
                { new: true }
            );
            if (!result) throw new Error("Producto no encontrado para actualizar.");
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            throw new Error("No se pudo actualizar el producto.");
        }
    }
}
