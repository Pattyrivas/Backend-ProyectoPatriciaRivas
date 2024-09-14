import { isValidObjectId } from "mongoose";
import { ProductsManager } from "../dao/ProductsManager.js";

export const pidValidate = async (req, res, next) => {
    const { pid } = req.params;
    
    if (!isValidObjectId(pid)){
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "ID Invalido" });
    }

    try {
        await ProductsManager.pidVerify(pid);
        next();
    } catch (error) {
        console.log(error);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
            error: `El producto con id ${pid} no existe`,
            detalle: `${error.message}`,
        });
    }
};