// Obtener los elementos del DOM
const containerHome = document.getElementById("container-home");
const currentPage = document.getElementById("current-page");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const cartView = document.getElementById("cart-view");

let maxPage;
let currentPageNumber;

// Obtener todos los productos
const getProducts = async () => {
    try {
        const params = new URLSearchParams(location.search);
        let page = params.get("page");
        
        // Validar el número de página
        if (!page || isNaN(Number(page))) {
            page = 1;
        }

        const res = await fetch(`/api/products/?page=${page}`);

        if (!res.ok) {
            throw new Error(`Error al obtener productos: ${res.statusText}`);
        }

        const data = await res.json();
        maxPage = data.totalPages;
        currentPageNumber = data.page;

        // Limpiar contenedor antes de agregar nuevos productos
        containerHome.innerHTML = "";

        // Renderizar productos
        containerHome.innerHTML += data.payload
            .map(
                (prod) => `
                <div class="card-product">
                    <header class="card-header">
                        <div class="img-container">
                            ${prod.thumbnails.map(
                                (thumbnail) => `<img src="${thumbnail}" alt="Imagen del producto">`,
                            ).join('')}  
                        </div>          
                    </header>
                    <div class="card-content">
                        <h3 class="title-product">${prod.title}</h3>
                        <p class="description-product">${prod.description}</p>
                        <p class="price-product">$${prod.price}</p>
                    </div>
                    <footer class="card-footer">
                        <button class="btn-addToCart" data-id="${prod.id}">Agregar al carrito</button>
                    </footer>
                </div>
            `
            ).join("");
        
        updatePaginationButtons();
    } catch (err) {
        console.error("Error al cargar productos:", err);
    }
};

// Actualizar botones de paginación
const updatePaginationButtons = () => {
    currentPage.textContent = currentPageNumber;
    
    btnNext.disabled = currentPageNumber >= maxPage;
    btnPrev.disabled = currentPageNumber <= 1;
};

// Inicialización de productos y paginación
const params = new URLSearchParams(location.search);
let page = Number(params.get('page'));
if (!page || isNaN(page)) {
    page = 1;
}

// Obtener productos al cargar la página
getProducts();

// Redireccionar a la siguiente página
btnNext.addEventListener('click', () => {
    if (currentPageNumber < maxPage) {
        page++;
        location.href = `/products?page=${page}`;
    }
});

// Redireccionar a la página anterior
btnPrev.addEventListener('click', () => {
    if (currentPageNumber > 1) {
        page--;
        location.href = `/products?page=${page}`;
    }
});

// Redireccionar a la vista del carrito
cartView.addEventListener("click", () => {
    location.href = `/cart`;
});

// Agregar productos al carrito
const CART = "66e55a99cad68a6ee320e5dc"; // ID del carrito 

containerHome.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-addToCart")) {
        const id = e.target.dataset.id;

        try {
            const res = await fetch(`/api/carts/${CART}/products/${id}`, {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error(`Error al agregar producto al carrito: ${res.statusText}`);
            }

            console.log(`Producto con ID ${id} agregado al carrito.`);
        } catch (err) {
            console.error("Error al agregar producto al carrito:", err);
        }
    }
});
