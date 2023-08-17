document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(0);

    const selectElement = document.getElementById('opciones'); // Elemento select en tu HTML
    const productsSection = document.querySelector('.section .products'); // Contenedor de productos
    const cartContainer = document.querySelector('.cart-container');
    
    const carritoBtn = document.getElementById('carrito-btn');

    let allProducts = []; // Almacenar todos los productos
    let closeModalBtn = document.querySelector('.close-modal'); // Botón para cerrar el modal
    const productModal = document.getElementById('product-modal');
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');    
    
    const buyButton = document.getElementById('buy-button');
   

    // Obtener los productos del API
    fetch('https://ecommercebackend.fundamentos-29.repl.co/')
        .then(response => response.json())
        .then(data => {
            allProducts = data; // Almacenar los productos en la variable

            // Crear opción "Todos" en el elemento select
            const optionTodos = document.createElement('option');
            optionTodos.value = 'todos';
            optionTodos.textContent = 'Todos';
            selectElement.appendChild(optionTodos);

            // Crear opciones en el elemento select para cada categoría (en mayúsculas)
            const categories = getUniqueCategories(data);
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.toLowerCase();
                option.textContent = category.toUpperCase(); // Convertir a mayúsculas
                selectElement.appendChild(option);
            });

            // Cargar todos los productos por defecto al inicio
            showProducts(allProducts);
            updateTotalAmount();

        })
        .catch(error => console.error('Error al obtener los datos del API:', error));
        // Eliminar datos del carrito del localStorage al recargar la página
        window.addEventListener('beforeunload', () => {
            localStorage.removeItem('cart');
        });

    // Agregar evento para filtrar productos al cambiar la opción del select
    selectElement.addEventListener('change', () => {
        const selectedCategory = selectElement.value.toLowerCase();

        // Filtrar los productos por la categoría seleccionada o mostrar todos
        const filteredProducts = selectedCategory === 'todos'
            ? allProducts
            : allProducts.filter(product => product.category === selectedCategory);

        // Mostrar los productos filtrados
        showProducts(filteredProducts);
    });

   // Agregar evento para mostrar/ocultar la sección del carrito al hacer clic en el botón

   carritoBtn.addEventListener('click', () => {
        // Cambiar el estilo de visualización del contenedor del carrito
        if (cartContainer.style.display === 'none') {
            cartContainer.style.display = 'block';
        } else {
            cartContainer.style.display = 'none';
        }
    });
    // Función para mostrar productos en el contenedor
    function showProducts(products) {
        productsSection.innerHTML = '';

        // Mostrar los productos en el contenedor
        products.forEach(product => {
            const productDiv = createProductElement(product);
            productsSection.appendChild(productDiv);
        });
    } 
    
     // Resto del código para manejar el evento de clic en una imagen de producto y abrir el modal
     productsSection.addEventListener('click', event => {
        if (event.target.classList.contains('product-image')) {
            const productId = event.target.dataset.productId;
            const selectedProduct = allProducts.find(product => product.id.toString() === productId);

            if (selectedProduct) {
                modalImage.src = selectedProduct.image;
                modalName.textContent = selectedProduct.name;
                modalDescription.textContent = selectedProduct.description;
                modalPrice.textContent = `Precio: $${selectedProduct.price.toFixed(2)}`;
                productModal.style.display = 'block'; // Mostrar el modal
            }
        }

    });

    // Cerrar el modal al hacer clic en el botón de cerrar
    closeModalBtn.addEventListener('click', () => {
        productModal.style.display = 'none'; // Cerrar el modal
    }); 

    buyButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            alert('No hay productos en el carrito para comprar.');
        } else {
            const confirmed = confirm('¿Desea realizar la compra?');
            if (confirmed) {
                // Aquí puedes agregar la lógica para procesar la compra
                // Por ejemplo, vaciar el carrito y mostrar un mensaje de confirmación
                localStorage.removeItem('cart');
                updateCartCount(0);
                updateTotalAmount(0);
                alert('¡Compra realizada con éxito! Gracias por su compra.');
                 // Actualizar el stock de los productos comprados
                const updatedProducts = allProducts.map(product => {
                    const cartProduct = cart.find(cartItem => cartItem.id === product.id);
                    if (cartProduct) {
                        return {
                            ...product,
                            quantity: product.quantity - cartProduct.cartQuantity
                        };
                    }
                    return product;
                });
                allProducts = updatedProducts;
                
                // Actualizar la visualización del carrito (eliminar productos del DOM)
                const cartList = document.querySelector('.cart-list');
                cartList.innerHTML = '';
                
                // Mostrar los productos actualizados
                showProducts(updatedProducts);
            }
        }
    });
     
});

// Función para obtener categorías únicas de los productos
function getUniqueCategories(products) {
    const categories = [];
    products.forEach(product => {
        if (!categories.includes(product.category)) {
            categories.push(product.category);
        }
    });
    return categories;
}

// Función para crear el elemento de producto
function createProductElement(product) {
    const productDiv = document.createElement('div');
    productDiv.classList.add('product');

    const productImage = document.createElement('img');
    productImage.src = product.image;
    productImage.alt = product.name;
    productImage.classList.add('product-image'); // Agrega la clase 'product-image' a la imagen
    
    const addToCartButton = document.createElement('button');
    addToCartButton.textContent = 'Agregar al carrito';
    addToCartButton.classList.add('add-to-cart-button'); // Agrega una clase al botón

    // Agregar evento de clic para agregar el producto al carrito
    addToCartButton.addEventListener('click', () => {
        addToCart(product);
    });
     // Asignar el atributo data-product-id con el ID del producto
     productImage.setAttribute('data-product-id', product.id);

    const productName = document.createElement('p');
    productName.textContent = product.name;

    const productPrice = document.createElement('h3');
    // Formatear el precio con dos decimales usando toFixed()
    const formattedPrice = parseFloat(product.price).toFixed(2);
    productPrice.textContent = `$${formattedPrice}`;
   
    // Agregar elementos al contenedor de producto
    productDiv.appendChild(productImage);
    productDiv.appendChild(productName);
    productDiv.appendChild(productPrice);
    productDiv.appendChild(addToCartButton); // Agregar el botón al contenedor

    return productDiv;
  }



  // Función para agregar productos al carrito
function addToCart(product) {
    const cartContainer = document.querySelector('.cart-container');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingProductIndex = cart.findIndex(item => item.id === parseInt(product.id));
   
    if (existingProductIndex !== -1) {     
                 
            alert(`El producto "${product.name}" ya se encuentra en el carrito.`);
            cartContainer.style.display = 'block';       
    } else { 
        product.cartQuantity = 1;       
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(cart.length);
        alert(`Producto "${product.name}" agregado al carrito.`);
        agregarProductoAlCarrito(product); // Agregar el producto a la lista del carrito
    }

    updateTotalAmount();
   

}

// Función para actualizar el contador de productos en el carrito
function updateCartCount(count) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalQuantity = cart.reduce((total, product) => total + product.cartQuantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    cartCountElement.textContent = totalQuantity;
}

// Función para agregar un producto a la lista del carrito
function agregarProductoAlCarrito(product) {
    const cartList = document.querySelector('.cart-list');
    const card = document.createElement('div');
    card.classList.add('cart-item'); // Agrega la clase de estilo para tarjetas

    // Agregar el atributo data-product-id al elemento de tarjeta de producto
    card.setAttribute('data-product-id', product.id);
    // Obtener el elemento de tarjeta de producto actual
    const productCard = card;
    // Crear un elemento de imagen y establecer su atributo src
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;

    // Crear un elemento de div para contener los detalles del producto
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('product-details');

    // Crear un elemento de párrafo para el nombre del producto
    const productName = document.createElement('p');
    productName.textContent = product.name;
    productName.classList.add('product-name');

    // Crear un elemento de párrafo para el precio del producto
    const productPrice = document.createElement('p');
    productPrice.textContent = `Precio: $${product.price.toFixed(2)}`;
    productPrice.classList.add('product-price');

    // Crear un elemento de párrafo para el stock del producto
    const productStock = document.createElement('p');
    productStock.textContent = `Stock: ${product.quantity}`;
    productStock.classList.add('product-stock');

    // Crear un elemento de entrada para la cantidad del producto
    const productQuantityInput = document.createElement('input');
    productQuantityInput.type = 'text';
    productQuantityInput.value = 1; // Cantidad inicial
    productQuantityInput.min = 1; // Valor mínimo
    productQuantityInput.classList.add('product-quantity-input');

    // Crear botones para aumentar y disminuir cantidad
    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.classList.add('quantity-button');
    
    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '-';
    decreaseButton.classList.add('quantity-button');

    const deleteButton = document.createElement('button');    
    deleteButton.classList.add('delete-button');
    // Crear un elemento <i> para el ícono de tacho de basura
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas', 'fa-trash', 'delete-icon')
    deleteButton.appendChild(deleteIcon);

    // Crear un elemento <span> para mostrar el mensaje de error
    const errorMessage = document.createElement('span');
    errorMessage.classList.add('error-message');
    errorMessage.style.color = 'red'; // Cambiar el color del mensaje de error
    errorMessage.textContent = 'No intente superar el stock disponible';
    errorMessage.style.display = 'none';

    // Agregar el nombre, el precio y el stock al elemento de detalles
    detailsDiv.appendChild(productName);
    detailsDiv.appendChild(productPrice);
    detailsDiv.appendChild(productStock);
    detailsDiv.appendChild(decreaseButton);
    detailsDiv.appendChild(productQuantityInput); 
    detailsDiv.appendChild(increaseButton);
    detailsDiv.appendChild(deleteButton);
    // Agregar el mensaje de error al contenedor de detalles
    detailsDiv.appendChild(errorMessage);


    // Agregar la imagen y el contenedor de detalles a la tarjeta
    card.appendChild(img);
    card.appendChild(detailsDiv);
    
    // Agregar la tarjeta al contenedor de la lista del carrito
    cartList.appendChild(card);

    let currentQuantity = 1; // Inicializar la cantidad    

    // Manejar el evento de clic en el botón de aumentar cantidad
    increaseButton.addEventListener('click', () => {
        if (currentQuantity < product.quantity) {
            currentQuantity++;
            productQuantityInput.value = currentQuantity;
            updateCartQuantity(product.id, currentQuantity);
            updateCartCount(); // Actualizar el contador
            errorMessage.style.display = 'none';
        } else {
            errorMessage.style.display = 'block'; // Mostrar el mensaje de error
        }
    });

    // Manejar el evento de clic en el botón de disminuir cantidad
    decreaseButton.addEventListener('click', () => {
        if (currentQuantity > 1) {
            currentQuantity--;
            productQuantityInput.value = currentQuantity;
            errorMessage.style.display = 'none';
            updateCartQuantity(product.id, currentQuantity);
            updateCartCount();
        }
    });

    deleteButton.addEventListener('click', () => {
        const productId = product.id;
        removeFromCart(productId); // Llamar a la función para eliminar el producto
        cartList.removeChild(card); // Remover la tarjeta del producto de la lista visual
        updateCartCount(); // Actualizar el contador
    });


    // Manejar el evento de cambio en el campo de entrada de cantidad
    productQuantityInput.addEventListener('change', () => {
        const newQuantity = parseInt(productQuantityInput.value);
        if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= product.quantity) {
            updateCartQuantity(product.id, newQuantity);
            currentQuantity = newQuantity; // Actualizar la cantidad actual
            errorMessage.style.display = 'none'; // Ocultar el mensaje de error
        } else {
            errorMessage.style.display = 'block'; // Mostrar el mensaje de error
        }
    });
}

// Función para actualizar la cantidad en el carrito
function updateCartQuantity(productId, cartQuantity) {
    
  // Actualizar la cantidad visualmente en la tarjeta del producto en la lista del carrito
  const productCard = document.querySelector(`.cart-item [data-product-id="${productId}"]`);
    
  if (productCard) {
      const productQuantityInput = productCard.querySelector('.product-quantity-input');
      productQuantityInput.value = cartQuantity;
  }
    // Actualizar la cantidad en el almacenamiento local
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.map(product => {
        if (product.id === productId) {
            return { ...product, cartQuantity };
        }
        return product;
    });

    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Actualizar el contador del carrito
    updateCartCount(updatedCart.length);
    // Después de actualizar la cantidad
updateTotalAmount();
}


function removeFromCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(product => product.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    // Después de eliminar el producto del carrito
    updateTotalAmount();
}

function updateTotalAmount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalAmount = cart.reduce((total, product) => total + (product.price * product.cartQuantity), 0);
    const totalAmountElement = document.getElementById('total-amount');
    totalAmountElement.textContent = totalAmount.toFixed(2);
}



