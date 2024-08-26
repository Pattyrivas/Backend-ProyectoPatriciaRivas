import express from 'express';
import ProductsManager from '../dao/ProductsManager.js';

const router = express.Router();

// Ruta para mostrar productos en home.handlebars
router.get('/', async (req, res) => {
    try {
        const products = await ProductsManager.getProducts();
        res.render('home', { title: 'Lista de Productos', products });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).send('Error loading products');
    }
});

// Ruta para mostrar productos en tiempo real en realTimeProducts.handlebars
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductsManager.getProducts();
        res.render('realTimeProducts', { title: 'Productos en Tiempo Real', products });
    } catch (error) {
        console.error('Error loading products for real-time view:', error);
        res.status(500).send('Error loading products');
    }
});

export default router;
