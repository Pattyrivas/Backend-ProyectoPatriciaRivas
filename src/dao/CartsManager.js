import { Cart } from './models/Cart.js';

export class CartsManager {
    static async createCart() {
        try {
            const newCart = { products: [] };
            return await Cart.create(newCart);
        } catch (error) {
            console.error("Error al crear el carrito:", error);
            throw new Error("Error al crear el carrito.");
        }
    }

    static async getCartProducts(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate("products.product").lean();
            if (!cart) {
                throw new Error("Carrito no encontrado.");
            }
            return cart;
        } catch (error) {
            console.error("Error al obtener los productos del carrito:", error);
            throw new Error("Error al obtener los productos del carrito.");
        }
    }

    static async addProductToCart(cartId, productId) {
        try {
            const existingProduct = await Cart.findOne({
                _id: cartId,
                "products.product": productId,
            });

            if (existingProduct) {
                await Cart.updateOne(
                    { _id: cartId, "products.product": productId },
                    { $inc: { "products.$.quantity": 1 } }
                );
            } else {
                await Cart.updateOne(
                    { _id: cartId },
                    { $push: { products: { product: productId, quantity: 1 } } }
                );
            }
        } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
            throw new Error("Error al agregar producto al carrito.");
        }
    }

    static async deleteProductFromCart(cartId, productId) {
        try {
            await Cart.updateOne(
                { _id: cartId },
                { $pull: { products: { product: productId } } }
            );
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error);
            throw new Error("Error al eliminar producto del carrito.");
        }
    }

    static async deleteAllProducts(cartId) {
        try {
            await Cart.updateOne(
                { _id: cartId },
                { $set: { products: [] } }
            );
        } catch (error) {
            console.error("Error al eliminar todos los productos del carrito:", error);
            throw new Error("Error al eliminar todos los productos del carrito.");
        }
    }

    static async updateAllCart(cartId, products) {
        try {
            await Cart.updateOne(
                { _id: cartId },
                { $set: { products } }
            );
        } catch (error) {
            console.error("Error al actualizar el carrito:", error);
            throw new Error("Error al actualizar el carrito.");
        }
    }

    static async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (quantity < 0) {
                throw new Error("La cantidad no puede ser negativa.");
            }
            await Cart.updateOne(
                { _id: cartId, "products.product": productId },
                { $set: { "products.$.quantity": quantity } }
            );
        } catch (error) {
            console.error("Error al actualizar la cantidad del producto en el carrito:", error);
            throw new Error("Error al actualizar la cantidad del producto en el carrito.");
        }
    }
}
