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

// Obtener productos de un carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const products = await CartsManager.getCartProducts(cartId);

        if (!products) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(products);
    } catch (error) {
        console.error('Error retrieving cart products:', error.message);
        res.status(500).json({ error: 'Error retrieving cart products' });
    }
});

// Agregar un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const updatedProducts = await CartsManager.addProductToCart(cartId, productId);
        res.json(updatedProducts);
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


export default router;
