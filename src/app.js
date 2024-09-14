import express from 'express'; 
import { engine } from 'express-handlebars';
import { productsRouter } from './routes/products.routes.js'; 
import { cartsRouter } from './routes/carts.routes.js'; 
import { viewsRouter } from './routes/views.routes.js'; 
import { Server } from 'socket.io'; 
import { connDB } from './connDB.js'; 
import { ProductsManager } from "./dao/ProductsManager.js"; 
import { CartsManager } from "./dao/CartsManager.js"; 
import { config } from "./config/config.js";

const app = express(); 
const PORT = config.PORT; 
// Servidor escuchando
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`); 
});

export const io = new Server(httpServer); 

// Conexión a la base de datos
connDB(); 

// Configuración de path y Handlebars
ProductsManager.path = "./src/data/products.json"; 
CartsManager.path = "./src/data/cart.json" 

app.engine('handlebars', engine()); 
app.set('view engine', 'handlebars'); 
app.set('views', "./src/views"); 

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 


// Rutas
app.use('/', viewsRouter); 
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter); 

// Socket.IO
io.on("connection", socket => {
    socket.on("message", message => {
        console.log(message);
    });
})
