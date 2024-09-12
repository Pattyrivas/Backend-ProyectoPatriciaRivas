import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

class CartsManager {
    // Obtener todos los carritos con los productos 
    static async getCarts() {
        return await Cart.find().populate('products.product');
    }

    // Crear un nuevo carrito
    static async addCart() {
        const newCart = new Cart({ products: [] });
        return await newCart.save();
    }

    // Obtener un carrito específico con productos
    static async getCartWithProducts(cartId) {
        const cart = await Cart.findById(cartId).populate('products.product');
        return cart || null;
    }

    // Agregar un producto al carrito
    static async addProductToCart(cartId, productId) {
        // Buscar el carrito por ID
        let cart = await Cart.findById(cartId);

        // Si el carrito no existe, crear uno nuevo
        if (!cart) {
            cart = new Cart({ products: [] });
            await cart.save(); 
        }

        // Buscar el producto por ID
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error(`Producto con ID ${productId} no encontrado.`);
        }

        // Buscar el índice del producto en el carrito
        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex === -1) {
            // Si el producto no está en el carrito, agregarlo con cantidad 1
            cart.products.push({ product: productId, quantity: 1 });
        } else {
            // Si el producto ya está en el carrito, incrementar la cantidad
            cart.products[productIndex].quantity += 1;
        }

        // Guardar los cambios en el carrito en la base de datos
        return await cart.save();
    }

    // Actualizar el carrito con un arreglo de productos
    static async updateCartProducts(cartId, products) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error(`Carrito con ID ${cartId} no encontrado.`);

        cart.products = products.map(p => ({
            product: p.product,
            quantity: p.quantity
        }));

        return await cart.save();
    }

    // Actualizar la cantidad de un producto en el carrito
    static async updateProductQuantity(cartId, productId, quantity) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error(`Carrito con ID ${cartId} no encontrado.`);

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex === -1) throw new Error(`Producto con ID ${productId} no encontrado en el carrito.`);

        cart.products[productIndex].quantity = quantity;
        return await cart.save();
    }

    // Eliminar un producto específico del carrito
    static async removeProductFromCart(cartId, productId) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error(`Carrito con ID ${cartId} no encontrado.`);

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex === -1) throw new Error(`Producto con ID ${productId} no encontrado en el carrito.`);

        cart.products.splice(productIndex, 1); 
        return await cart.save();
    }

    // Eliminar todos los productos del carrito
    static async clearCart(cartId) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error(`Carrito con ID ${cartId} no encontrado.`);

        cart.products = [];
        return await cart.save();
    }
}

export default CartsManager;
