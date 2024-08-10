import fs from 'fs';
import path from 'path';

const productsFilePath = path.resolve('src/data/products.json');

class ProductsManager {
    static async getProducts() {
        if (fs.existsSync(productsFilePath)) {
            const products = JSON.parse(await fs.promises.readFile(productsFilePath, 'utf-8'));
            return products.map(p => ({
                ...p,
                title: p.title || 'No Title',
                description: p.description || 'No Description'
            }));
        } else {
            return [];
        }
    }

    static async addProduct(product = {}) {
        const products = await this.getProducts();
        const newId = (products.length > 0) ? (parseInt(products[products.length - 1].id) + 1).toString() : '1';
        const newProduct = {
            id: newId, 
            ...product,
            status: product.status !== undefined ? product.status : true
        };

        products.push(newProduct);

        await fs.promises.writeFile(productsFilePath, JSON.stringify(products, null, 2));

        return newProduct;
    }

    static async updateProduct(id, updatedProduct = {}) {
        try {
            const products = await this.getProducts();
            const index = products.findIndex(p => p.id === id);
    
            if (index === -1) {
                return null; 
            }
    
            products[index] = {
                ...products[index],
                ...updatedProduct,
                id
            };
    
            await fs.promises.writeFile(productsFilePath, JSON.stringify(products, null, 2));
    
            return products[index];
        } catch (error) {
            console.error('Error updating product:', error.message); 
            throw new Error('Error updating product');
        }
    }
    

    static async deleteProduct(id) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) {
            // Retorna 0 cuando el producto no se encuentra
            return 0;
        }
    
        const filteredProducts = products.filter(p => p.id !== id);
    
        await fs.promises.writeFile(productsFilePath, JSON.stringify(filteredProducts, null, 2));
    
        // Retorna 1 cuando el producto se elimina exitosamente
        return 1;
    }
    
    
}

export default ProductsManager;
