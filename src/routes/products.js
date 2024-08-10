import express from 'express';
import ProductsManager from '../dao/ProductsManager.js';

const router = express.Router();

// Obtener todos los productos con un límite opcional
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        let products = await ProductsManager.getProducts();
        if (limit && !isNaN(limit)) {
            products = products.slice(0, limit);
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving products' });
    }
});

// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid; 
        const products = await ProductsManager.getProducts();
        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving product' });
    }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const addedProduct = await ProductsManager.addProduct(newProduct);
        res.status(201).json(addedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error adding product' });
    }
});

// Actualizar un producto por ID
router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid; 
        const updatedProduct = req.body;

        if (Object.keys(updatedProduct).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const product = await ProductsManager.updateProduct(productId, updatedProduct);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error.message); 
        res.status(500).json({ error: 'Error updating product' });
    }
});


// Eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const result = await ProductsManager.deleteProduct(productId);
        if (result === 0) {
            // Producto no encontrado
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(204).end();
    } catch (error) {
        
        console.error('Error deleting product:', error); 
        res.status(500).json({ error: 'Error deleting product' });
    }
});



export default router;
