import Router from 'express';
import { CartsManager } from '../dao/CartsManager.js';
import { isValidObjectId } from "mongoose";

export const cartsRouter = Router();

// Obtener productos del carrito por ID de carrito
cartsRouter.get("/:cid", async (req, res) => {
    const { cid } = req.params;

    if (!cid) return res.status(400).json({ error: "ID del carrito no proporcionado" });
    if (!isValidObjectId(cid)) return res.status(400).json({ message: "ID de carrito inválido" });

    try {
        const products = await CartsManager.getCartProducts(cid);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener productos del carrito:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Actualizar todos los productos del carrito
cartsRouter.put("/:cid", async (req, res) => {
    const { cid } = req.params;
    const products = req.body;

    if (!cid || !products) {
        return res.status(400).json({ error: "Faltan parámetros obligatorios" });
    }

    if (!isValidObjectId(cid)) return res.status(400).json({ message: "ID de carrito inválido" });

    try {
        await CartsManager.updateAllCart(cid, products);
        res.status(200).json({ message: "Carrito actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar el carrito:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Actualizar cantidad de producto en carrito
cartsRouter.put("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!cid || !pid || !quantity) {
        return res.status(400).json({ error: "Faltan parámetros obligatorios" });
    }

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ message: "ID de carrito o producto inválido" });
    }

    const quantityNumber = Number(quantity);
    if (isNaN(quantityNumber)) return res.status(400).json({ error: "La cantidad debe ser un número válido" });

    try {
        await CartsManager.updateProductQuantity(cid, pid, quantityNumber);
        res.status(200).json({ message: "Cantidad del producto actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar la cantidad del producto:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Crear un nuevo carrito
cartsRouter.post("/", async (req, res) => {
    try {
        const cart = await CartsManager.createCart();
        res.status(201).json({ message: "Carrito creado", cart });
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Agregar producto al carrito
cartsRouter.post("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    if (!cid || !pid) {
        return res.status(400).json({ error: "Faltan parámetros obligatorios" });
    }

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ message: "ID de carrito o producto inválido" });
    }

    try {
        await CartsManager.addProductToCart(cid, pid);
        res.status(200).json({ message: "Producto agregado al carrito correctamente" });
    } catch (error) {
        console.error("Error al agregar el producto al carrito:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Eliminar producto del carrito
cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    if (!cid || !pid) {
        return res.status(400).json({ error: "Faltan parámetros obligatorios" });
    }

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ message: "ID de carrito o producto inválido" });
    }

    try {
        await CartsManager.deleteProductFromCart(cid, pid);
        res.status(200).json({ message: "Producto eliminado del carrito correctamente" });
    } catch (error) {
        console.error("Error al eliminar el producto del carrito:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Eliminar todos los productos del carrito
cartsRouter.delete("/:cid", async (req, res) => {
    const { cid } = req.params;

    if (!cid) {
        return res.status(400).json({ error: "ID del carrito no proporcionado" });
    }

    if (!isValidObjectId(cid)) return res.status(400).json({ message: "ID de carrito inválido" });

    try {
        await CartsManager.deleteAllProducts(cid);
        res.status(200).json({ message: "Todos los productos han sido eliminados del carrito" });
    } catch (error) {
        console.error("Error al eliminar todos los productos del carrito:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});
