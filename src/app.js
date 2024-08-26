import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import viewsRouter from './routes/viewsRouter.js';
import ProductsManager from './dao/ProductsManager.js';
import { createServer } from 'http';
import { Server } from 'socket.io';


const app = express();
const PORT = 8080;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Crear servidor y configurar socket.io
const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

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

// Middleware para pasar el servidor io a las rutas
app.use((req, res, next) => {
    req.io = io;
    next();
});


server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
