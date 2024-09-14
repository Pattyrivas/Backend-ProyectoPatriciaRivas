const socket = io();

// Detecta si estamos en la página de productos en tiempo real y envía un mensaje de conexión
if (window.location.pathname === '/realTimeProducts') {
    socket.emit("message", "Real time products conectado!");
}

// Obtiene los elementos del DOM
const containerProducts = document.getElementById("container-products");
const productsForm = document.getElementById("products-form");

// Escucha el evento de agregar producto
socket.on("addProduct", (data) => {
    if (!data || !data.title || !data.description || !data.price || !data.id) {
        console.error("Datos de producto inválidos", data);
        return;
    }

    const productHTML = `
        <div class="card-product">
            <header class="card-header">            
                <div class="img-container">
                    <img src=${""} alt="Imagen de producto">
                </div>
            </header>
            <div class="card-content">
                <h3 class="title-product">${data.title}</h3>
                <p class="description-product">${data.description}</p>
                <p class="price-product">$${data.price}</p>
            </div>
            <footer class="card-footer">
                <button class="btn-delete" data-id="${data.id}">Eliminar</button>
            </footer>
        </div>
    `;
    
    containerProducts.insertAdjacentHTML('beforeend', productHTML);
});

// Escucha el evento de eliminar producto
socket.on("deleteProduct", (id) => {
    const productElement = document.querySelector(`[data-id="${id}"]`);
    if (productElement) {
        productElement.closest(".card-product").remove();
    } else {
        console.error("Producto no encontrado para eliminar", id);
    }
});

// Evento de envío del formulario de productos
productsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    try {
        const formData = new FormData(productsForm);
        const response = await fetch("/api/products", {
            method: "POST",
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error("Error al crear el producto");
        }
        
        console.log('Producto creado correctamente');
    } catch (error) {
        console.error("Error al enviar el formulario:", error);
    }
});

// Evento para eliminar producto desde el contenedor de productos
containerProducts.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
        const id = e.target.dataset.id;
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            
            if (!response.ok) {
                throw new Error("Error al eliminar el producto");
            }

            console.log(`Producto con ID ${id} eliminado`);
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
        }
    }
});
