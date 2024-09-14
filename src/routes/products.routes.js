import { Router } from "express";
import { ProductsManager } from "../dao/ProductsManager.js";
import { uploader } from "../utils/uploader.js";
import { pidValidate } from "../middlewares/pidValidate.js";
import { io } from "../app.js";

export const productsRouter = Router();

// Obtener producto por ID
productsRouter.get("/:pid", pidValidate, async (req, res) => {
    const { pid } = req.params;

    try {
        const product = await ProductsManager.getProductsById(pid);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error al obtener producto por ID:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Obtener productos con filtros
productsRouter.get("/", async (req, res) => {
    const { limit, page, query, sort } = req.query;

    const limitNumber = Number(limit);
    const pageNumber = Number(page);

    if (limit && isNaN(limitNumber)) {
        return res.status(400).json({ error: "El límite debe ser un número válido" });
    }
    if (page && isNaN(pageNumber)) {
        return res.status(400).json({ error: "La página debe ser un número válido" });
    }

    try {
        const products = await ProductsManager.getProducts(limitNumber || 10, pageNumber || 1, query, sort);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Actualizar un producto por ID
productsRouter.put("/:pid", pidValidate, uploader.array("thumbnails", 3), async (req, res) => {
    const { pid } = req.params;
    const { price, stock, title, description, code, category } = req.body;

    if (!price || !stock || !title || !description || !code || !category) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber) || stockNumber < 0 || priceNumber <= 0) {
        return res.status(400).json({ error: "El precio y el stock deben ser números válidos y mayores a 0" });
    }

    const productUpdated = {
        title,
        description,
        code,
        category,
        price: priceNumber,
        status: true,
        stock: stockNumber,
        thumbnails: req.files ? req.files.map((file) => file.path) : [],
    };

    try {
        await ProductsManager.updateProduct(productUpdated, pid);
        res.status(200).json({
            mensaje: "Producto modificado",
            product: productUpdated,
        });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Crear un nuevo producto
productsRouter.post("/", uploader.array("thumbnails", 3), async (req, res) => {
    const { price, stock, title, description, code, category } = req.body;

    if (!price || !stock || !title || !description || !code || !category) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber) || stockNumber < 0 || priceNumber <= 0) {
        return res.status(400).json({ error: "El precio y el stock deben ser números válidos y mayores a 0" });
    }

    const newProduct = {
        title,
        description,
        code,
        category,
        price: priceNumber,
        status: true,
        stock: stockNumber,
        thumbnails: req.files ? req.files.map((file) => file.path) : [],
    };

    try {
        await ProductsManager.addProduct(newProduct);
        io.emit("addProduct", newProduct);
        res.status(201).json({ message: "Producto creado", product: newProduct });
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Eliminar un producto por ID
productsRouter.delete("/:pid", pidValidate, async (req, res) => {
    const { pid } = req.params;

    try {
        await ProductsManager.deleteProduct(pid);
        io.emit("deleteProduct", pid);
        res.status(200).json({ mensaje: "Producto eliminado.", id: pid });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});
