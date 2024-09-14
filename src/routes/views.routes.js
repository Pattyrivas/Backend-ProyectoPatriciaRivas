import { Router } from "express";
import { ProductsManager } from "../dao/ProductsManager.js";
import { CartsManager } from "../dao/CartsManager.js";

export const viewsRouter = Router();

// Renderizar la vista del carrito
viewsRouter.get("/cart", async (req, res) => {
    const cartId = "66e55a99cad68a6ee320e5dc";  // Este ID debería ser dinámico en un caso real
    try {
        const cartProducts = await CartsManager.getCartProducts(cartId);

        if (!cartProducts || !cartProducts.products) {
            return res.status(404).render("error", { error: "Carrito no encontrado" });
        }

        res.status(200).render("cart", {
            title: "Cart",
            products: cartProducts.products,
        });
    } catch (error) {
        console.error("Error al cargar el carrito:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Renderizar la vista de productos con carrito
viewsRouter.get("/products", async (req, res) => {
    const cartId = "66e55a99cad68a6ee320e5dc";  // Este ID debería ser dinámico en un caso real
    try {
        const products = await ProductsManager.getProducts();
        const cart = await CartsManager.getCartProducts(cartId);

        if (!products || !products.payload || !cart || !cart.products) {
            return res.status(404).render("error", { error: "Productos o carrito no encontrado" });
        }

        res.status(200).render("home", {
            title: "Home",
            products: products.payload,
            page: products.page || 1,
            totalPages: products.totalPages || 1,
            numCarts: cart.products.length || 0,
        });
    } catch (error) {
        console.error("Error al cargar productos y carrito:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});

// Renderizar la vista de productos en tiempo real
viewsRouter.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await ProductsManager.getProducts();

        if (!products || !products.payload) {
            return res.status(404).render("error", { error: "Productos no encontrados" });
        }

        res.status(200).render("realTimeProducts", {
            title: "Real Time Products",
            products: products.payload,
        });
    } catch (error) {
        console.error("Error al cargar productos en tiempo real:", error);
        res.status(500).json({
            error: "Error en el servidor",
            detalle: error.message,
        });
    }
});
