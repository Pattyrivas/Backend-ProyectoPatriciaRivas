import express from 'express';
import Product from '../models/Product.js'; 

const router = express.Router();

// Obtener todos los productos con paginación, filtros y ordenamientos
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = '', query = '' } = req.query;

        const filters = {};
        if (query) {
            filters.$or = [
                { title: new RegExp(query, 'i') }, // Cambiado a 'title' para consistencia
                { category: new RegExp(query, 'i') }
            ];
        }

        const sortOptions = {};
        if (sort === 'asc') {
            sortOptions.price = 1;
        } else if (sort === 'desc') {
            sortOptions.price = -1;
        }

        const products = await Product.find(filters)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalProducts = await Product.countDocuments(filters);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));
        const prevPage = parseInt(page) > 1 ? parseInt(page) - 1 : null;
        const nextPage = parseInt(page) < totalPages ? parseInt(page) + 1 : null;

        res.json({
            status: 'success',
            payload: products,
            totalPages,
            prevPage,
            nextPage,
            page: parseInt(page),
            hasPrevPage: prevPage !== null,
            hasNextPage: nextPage !== null,
            prevLink: prevPage ? `/api/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${query}` : null,
            nextLink: nextPage ? `/api/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${query}` : null
        });
    } catch (error) {
        console.error('Error retrieving products:', error.message);
        res.status(500).json({ error: 'Error retrieving products' });
    }
});

// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await Product.findById(productId);
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
        if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.category) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const addedProduct = await Product.create(newProduct);

        // Emitir la actualización de productos (considera si es necesario)
        if (req.io) {
            req.io.emit('updateProducts', await Product.find());
        }
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

        const product = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });

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
        const result = await Product.findByIdAndDelete(productId);
        if (!result) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Emitir la actualización de productos (considera si es necesario)
        if (req.io) {
            req.io.emit('updateProducts', await Product.find());
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
});

export default router;
