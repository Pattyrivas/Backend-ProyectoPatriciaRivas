import express from 'express';
import CartsManager from '../dao/CartsManager.js';

const router = express.Router();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await CartsManager.addCart();  
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error creating cart' });
    }
});

// Obtener productos de un carrito por ID (con populate)
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await CartsManager.getCartWithProducts(cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (error) {
        console.error('Error retrieving cart:', error.message);
        res.status(500).json({ error: 'Error retrieving cart' });
    }
});

// Agregar un producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const updatedCart = await CartsManager.addProductToCart(cartId, productId);
        res.json(updatedCart);
    } catch (error) {
        if (error.message.includes('Cart with id')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Product with id')) {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error adding product to cart:', error.message);
        res.status(500).json({ error: 'Error adding product to cart' });
    }
});

// Actualizar el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const { products } = req.body; // Se espera un arreglo de productos [{ product: 'productId', quantity: 1 }, ...]

        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'Products must be an array' });
        }

        const updatedCart = await CartsManager.updateCartProducts(cartId, products);

        if (!updatedCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(updatedCart);
    } catch (error) {
        console.error('Error updating cart products:', error.message);
        res.status(500).json({ error: 'Error updating cart products' });
    }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than zero' });
        }

        const updatedCart = await CartsManager.updateProductQuantity(cartId, productId, quantity);

        if (!updatedCart) {
            return res.status(404).json({ error: 'Cart or product not found' });
        }

        res.json(updatedCart);
    } catch (error) {
        console.error('Error updating product quantity in cart:', error.message);
        res.status(500).json({ error: 'Error updating product quantity in cart' });
    }
});

// Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const updatedCart = await CartsManager.removeProductFromCart(cartId, productId);

        if (!updatedCart) {
            return res.status(404).json({ error: 'Cart or product not found' });
        }

        res.json(updatedCart);
    } catch (error) {
        console.error('Error removing product from cart:', error.message);
        res.status(500).json({ error: 'Error removing product from cart' });
    }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const result = await CartsManager.clearCart(cartId);

        if (!result) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.status(204).end();
    } catch (error) {
        console.error('Error clearing cart:', error.message);
        res.status(500).json({ error: 'Error clearing cart' });
    }
});

export default router;
