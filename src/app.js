import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import viewsRouter from './routes/viewsRouter.js';
import ProductsManager from './dao/ProductsManager.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 8080;

// Configuración de Mongoose
const mongoURI = 'mongodb://localhost:27017/ecommerce'; 
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Configuración de path y Handlebars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Crear servidor y configurar socket.io
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para pasar el servidor io a las rutas
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rutas
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta para obtener la lista de productos
app.get('/api/products/list', async (req, res) => {
    try {
        const products = await ProductsManager.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error retrieving product list:', error.message);
        res.status(500).send('Error retrieving product list');
    }
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar lista inicial de productos
    socket.on('requestInitialProducts', async () => {
        try {
            const products = await ProductsManager.getProducts();
            socket.emit('updateProducts', products);
        } catch (error) {
            console.error('Error sending initial product list:', error.message);
        }
    });

    socket.on('newProduct', async (product) => {
        try {
            await ProductsManager.addProduct(product);
            io.emit('updateProducts', await ProductsManager.getProducts());
        } catch (error) {
            console.error('Error adding product via WebSocket:', error.message);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            const result = await ProductsManager.deleteProduct(productId);
            if (result === 1) {
                io.emit('updateProducts', await ProductsManager.getProducts());
            }
        } catch (error) {
            console.error('Error deleting product via WebSocket:', error.message);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
