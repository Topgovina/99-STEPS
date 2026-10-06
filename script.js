document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const mobileMenu = document.getElementById("mobileMenu");
    const menuBtn = document.getElementById("menuBtn");

    const searchBtn = document.getElementById("searchBtn");
    const searchOverlay = document.getElementById("searchOverlay");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const closeSearch = document.getElementById("closeSearch");

    const cartBtn = document.getElementById("cartBtn");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");
    const closeCart = document.getElementById("closeCart");
    const cartOverlay = document.getElementById("cartOverlay");

    const productModal = document.getElementById("productModal");
    const modalImage = document.getElementById("modalImage");
    const modalName = document.getElementById("modalName");
    const modalPrice = document.getElementById("modalPrice");
    const addToCartBtn = document.getElementById("addToCartBtn");
    const closeModal = document.getElementById("closeModal");

    const modalPrev = document.getElementById("modalPrev");
    const modalNext = document.getElementById("modalNext");
    const modalPage = document.getElementById("modalPage");

    const colorSelector = document.getElementById("colorSelector");
    const colorOptions = document.getElementById("colorOptions");

    const toast = document.getElementById("toast");
    const newsletterForm =
        document.getElementById("newsletterForm");


    // ==========================================
    // CART
    // ==========================================

    let cart =
        JSON.parse(localStorage.getItem("99stepsCart")) || [];

    let selectedProduct = null;
    let selectedSize = "M";
    let selectedVariantIndex = 0;


    // ==========================================
    // PRODUCT VARIANTS
    // ==========================================

    const productVariants = {

        "BLANC MAMBA": [
            {
                color: "PURPLE",
                image: "images/af1.jpeg"
            },
            {
                color: "GOLD",
                image: "images/af1b.jpeg"
            }
        ]

    };


    // ==========================================
    // FORMAT PRICE
    // ==========================================

    function formatPrice(price) {

        const number = Number(price);

        if (!Number.isFinite(number)) {
            return "GH₵0";
        }

        return `GH₵${number.toLocaleString("en-GH", {
            minimumFractionDigits: number % 1 !== 0 ? 2 : 0,
            maximumFractionDigits: 2
        })}`;
    }


    // ==========================================
    // TOAST
    // ==========================================

    function showToast(message) {

        if (!toast) {
            alert(message);
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(window.toastTimer);

        window.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }


    // ==========================================
    // SCROLL LOCK
    // ==========================================

    function lockScroll() {
        document.body.classList.add("no-scroll");
    }


    function unlockScroll() {

        const searchOpen =
            searchOverlay?.classList.contains("active");

        const cartOpen =
            cartDrawer?.classList.contains("active");

        const modalOpen =
            productModal?.classList.contains("active");

        if (!searchOpen && !cartOpen && !modalOpen) {
            document.body.classList.remove("no-scroll");
        }
    }


    // ==========================================
    // SEARCH
    // ==========================================

    function openSearch() {

        if (!searchOverlay) return;

        searchOverlay.classList.add("active");

        lockScroll();

        setTimeout(() => {
            searchInput?.focus();
        }, 100);
    }


    function closeSearchBox() {

        if (!searchOverlay) return;

        searchOverlay.classList.remove("active");

        if (searchInput) {
            searchInput.value = "";
        }

        if (searchResults) {
            searchResults.innerHTML = "";
        }

        unlockScroll();
    }


    searchBtn?.addEventListener("click", event => {

        event.preventDefault();

        openSearch();

    });


    closeSearch?.addEventListener(
        "click",
        closeSearchBox
    );


    searchInput?.addEventListener("input", () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();

        if (!searchResults) return;

        searchResults.innerHTML = "";

        if (!query) return;

        const products =
            document.querySelectorAll(".product-card");

        let found = false;

        products.forEach(product => {

            const name =
                product.dataset.name ||
                product.querySelector("h3")?.textContent.trim() ||
                "Product";

            const category =
                product.querySelector(".shop-product-info p")
                    ?.textContent.trim() || "";

            const searchableText =
                `${name} ${category}`.toLowerCase();

            if (!searchableText.includes(query)) {
                return;
            }

            found = true;

            const image =
                product.dataset.image ||
                product.querySelector("img")?.getAttribute("src") ||
                "";

            const price =
                Number(product.dataset.price);

            const result =
                document.createElement("div");

            result.className = "search-result";

            result.innerHTML = `
                <img
                    src="${image}"
                    alt="${name}"
                    style="
                        width:70px;
                        height:85px;
                        object-fit:cover;
                        margin-right:15px;
                    "
                >

                <div>
                    <h4>${name}</h4>

                    <p>
                        ${
                            Number.isFinite(price) && price > 0
                                ? formatPrice(price)
                                : "PRICE COMING SOON"
                        }
                    </p>
                </div>
            `;

            result.addEventListener("click", () => {

                closeSearchBox();

                openProductModal(product);

            });

            searchResults.appendChild(result);

        });


        if (!found) {

            searchResults.innerHTML = `
                <div
                    style="
                        padding:25px 0;
                        color:#777;
                    "
                >
                    No products found.
                </div>
            `;

        }

    });


    // ==========================================
    // CART DRAWER
    // ==========================================

    function openCart() {

        if (!cartDrawer) return;

        cartDrawer.classList.add("active");

        cartOverlay?.classList.add("active");

        lockScroll();
    }


    function closeCartDrawer() {

        if (!cartDrawer) return;

        cartDrawer.classList.remove("active");

        cartOverlay?.classList.remove("active");

        unlockScroll();
    }


    cartBtn?.addEventListener("click", event => {

        event.preventDefault();

        openCart();

    });


    closeCart?.addEventListener(
        "click",
        closeCartDrawer
    );


    cartOverlay?.addEventListener(
        "click",
        closeCartDrawer
    );


    // ==========================================
    // RENDER PRODUCT VARIANT
    // ==========================================

    function renderProductVariant(index) {

        if (!selectedProduct) return;

        const variants =
            selectedProduct.variants || [];

        if (!variants.length) return;


        if (index < 0) {
            index = variants.length - 1;
        }

        if (index >= variants.length) {
            index = 0;
        }


        selectedVariantIndex = index;


        const variant =
            variants[index];


        selectedProduct.image =
            variant.image;

        selectedProduct.color =
            variant.color || "";


        // IMAGE

        if (modalImage) {

            modalImage.src =
                variant.image;

            modalImage.alt =
                `${selectedProduct.name} ${variant.color || ""}`;

        }


        // PAGE

        if (modalPage) {

            modalPage.textContent =
                `${index + 1} / ${variants.length}`;

        }


        // ARROWS

        if (modalPrev && modalNext) {

            const multiple =
                variants.length > 1;

            modalPrev.style.display =
                multiple ? "flex" : "none";

            modalNext.style.display =
                multiple ? "flex" : "none";

        }


        // COLOR BUTTONS

        if (!colorOptions || !colorSelector) {
            return;
        }


        colorOptions.innerHTML = "";


        if (variants.length > 1) {

            colorSelector.style.display =
                "block";


            variants.forEach(
                (variant, variantIndex) => {

                    const button =
                        document.createElement("button");

                    button.type = "button";

                    button.className =
                        "color-button";


                    if (
                        variantIndex === index
                    ) {

                        button.classList.add(
                            "active"
                        );

                    }


                    button.dataset.colorIndex =
                        variantIndex;


                    button.setAttribute(
                        "aria-label",
                        variant.color || "Color"
                    );


                    colorOptions.appendChild(
                        button
                    );

                }
            );

        } else {

            colorSelector.style.display =
                "none";

        }

    }


    // ==========================================
    // OPEN PRODUCT MODAL
    // ==========================================

    function openProductModal(product) {

        if (!productModal) return;


        const name =
            product.dataset.name ||
            product.querySelector("h3")
                ?.textContent
                .trim() ||
            "Product";


        const image =
            product.dataset.image ||
            product.querySelector("img")
                ?.getAttribute("src") ||
            "";


        const price =
            parseFloat(
                product.dataset.price
            ) || 0;


        const variants =
            productVariants[name] || [
                {
                    color: "",
                    image: image
                }
            ];


        selectedVariantIndex = 0;


        selectedProduct = {

            name,

            price,

            variants,

            image:
                variants[0].image,

            color:
                variants[0].color || ""

        };


        selectedSize = "M";


        // NAME

        if (modalName) {

            modalName.textContent =
                name;

        }


        // PRICE

        if (modalPrice) {

            modalPrice.textContent =
                formatPrice(price);

        }


        // IMAGE / COLOR

        renderProductVariant(0);


        // SIZE RESET

        document
            .querySelectorAll(".sizes button")
            .forEach(button => {

                button.classList.remove(
                    "active"
                );


                if (
                    button.dataset.size === "M"
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            });


        productModal.classList.add(
            "active"
        );

        lockScroll();

    }


    // ==========================================
    // CLOSE PRODUCT MODAL
    // ==========================================

    function closeProductModal() {

        if (!productModal) return;

        productModal.classList.remove(
            "active"
        );

        unlockScroll();

    }


    closeModal?.addEventListener(
        "click",
        closeProductModal
    );


    productModal?.addEventListener(
        "click",
        event => {

            if (
                event.target === productModal
            ) {

                closeProductModal();

            }

        }
    );


    // ==========================================
    // QUICK VIEW
    // ==========================================

    document.addEventListener(
        "click",
        event => {

            const quickView =
                event.target.closest(
                    ".quick-view"
                );


            if (!quickView) return;


            event.preventDefault();

            event.stopPropagation();


            const product =
                quickView.closest(
                    ".product-card"
                );


            if (!product) return;


            openProductModal(product);

        }
    );


    // ==========================================
    // SIZE SELECTION
    // ==========================================

    document.addEventListener(
        "click",
        event => {

            const sizeButton =
                event.target.closest(
                    ".sizes button"
                );


            if (!sizeButton) return;


            document
                .querySelectorAll(".sizes button")
                .forEach(button => {

                    button.classList.remove(
                        "active"
                    );

                });


            sizeButton.classList.add(
                "active"
            );


            selectedSize =
                sizeButton.dataset.size ||
                sizeButton.textContent.trim();

        }
    );


    // ==========================================
    // ADD TO BAG
    // ==========================================

    addToCartBtn?.addEventListener(
        "click",
        () => {

            if (!selectedProduct) {

                showToast(
                    "Please select a product."
                );

                return;

            }


            if (
                !selectedProduct.price ||
                selectedProduct.price <= 0
            ) {

                showToast(
                    "Product price coming soon."
                );

                return;

            }


            const color =
                selectedProduct.color || "";


            // SAME PRODUCT = NAME + SIZE + COLOR

            const existing =
                cart.find(item =>

                    item.name ===
                        selectedProduct.name &&

                    item.size ===
                        selectedSize &&

                    (item.color || "") ===
                        color

                );


            if (existing) {

                existing.quantity += 1;

            } else {

                cart.push({

                    id:
                        Date.now() +
                        Math.random(),

                    name:
                        selectedProduct.name,

                    price:
                        Number(
                            selectedProduct.price
                        ),

                    image:
                        selectedProduct.image,

                    color,

                    size:
                        selectedSize,

                    quantity: 1

                });

            }


            saveCart();

            updateCart();

            closeProductModal();


            showToast(
                `${selectedProduct.name} added to your bag`
            );


            openCart();

        }
    );


    // ==========================================
    // SAVE CART
    // ==========================================

    function saveCart() {

        localStorage.setItem(
            "99stepsCart",
            JSON.stringify(cart)
        );

    }


    // ==========================================
    // UPDATE CART
    // ==========================================

    function updateCart() {

        if (!cartItems) {

            updateCartCount();

            return;

        }


        if (cart.length === 0) {

            cartItems.innerHTML = `

                <div class="empty-cart">

                    <p>
                        Your bag is empty.
                    </p>

                    <span>
                        Discover the latest
                        from 99STEPS.
                    </span>

                </div>

            `;

        } else {

            cartItems.innerHTML = "";


            cart.forEach(item => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "cart-item";


                div.innerHTML = `

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                    <div>

                        <h3>
                            ${item.name}
                        </h3>

                        ${
                            item.color
                                ? `
                                    <small>
                                        Color: ${item.color}
                                    </small>
                                `
                                : ""
                        }

                        <small>
                            Size: ${item.size}
                        </small>

                        <p class="cart-item-price">

                            ${formatPrice(
                                Number(item.price) *
                                Number(item.quantity)
                            )}

                        </p>


                        <div class="quantity">

                            <button
                                data-action="minus"
                                data-id="${item.id}"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                data-action="plus"
                                data-id="${item.id}"
                            >
                                +
                            </button>

                        </div>


                        <button
                            class="remove-item"
                            data-id="${item.id}"
                        >
                            REMOVE
                        </button>

                    </div>

                `;


                cartItems.appendChild(
                    div
                );

            });

        }


        updateCartTotal();

        updateCartCount();

    }


    // ==========================================
    // CART TOTAL
    // ==========================================

    function updateCartTotal() {

        const total =
            cart.reduce(
                (sum, item) =>

                    sum +
                    Number(item.price) *
                    Number(item.quantity),

                0
            );


        if (cartTotal) {

            cartTotal.textContent =
                formatPrice(total);

        }

    }


    // ==========================================
    // CART COUNT
    // ==========================================

    function updateCartCount() {

        const count =
            cart.reduce(
                (sum, item) =>

                    sum +
                    Number(item.quantity),

                0
            );


        if (cartCount) {

            cartCount.textContent =
                `(${count})`;

        }

    }


    // ==========================================
    // CART CONTROLS
    // ==========================================

    cartItems?.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );


            if (!button) return;


            const id =
                Number(
                    button.dataset.id
                );


            const item =
                cart.find(
                    product =>
                        Number(product.id) === id
                );


            if (!item) return;


            // PLUS

            if (
                button.dataset.action ===
                "plus"
            ) {

                item.quantity += 1;

            }


            // MINUS

            if (
                button.dataset.action ===
                "minus"
            ) {

                item.quantity -= 1;


                if (
                    item.quantity <= 0
                ) {

                    cart =
                        cart.filter(
                            product =>
                                Number(
                                    product.id
                                ) !== id
                        );

                }

            }


            // REMOVE

            if (
                button.classList.contains(
                    "remove-item"
                )
            ) {

                cart =
                    cart.filter(
                        product =>
                            Number(
                                product.id
                            ) !== id
                    );

            }


            saveCart();

            updateCart();

        }
    );


    // ==========================================
    // CHECKOUT
    // ==========================================

    const checkoutBtn =
        document.querySelector(
            ".checkout-btn"
        );


    checkoutBtn?.addEventListener(
        "click",
        () => {

            if (
                cart.length === 0
            ) {

                showToast(
                    "Your bag is empty."
                );

                return;

            }


            window.location.href =
                "./checkout.html";

        }
    );


    // ==========================================
    // MOBILE MENU
    // ==========================================

    menuBtn?.addEventListener(
        "click",
        () => {

            mobileMenu?.classList.toggle(
                "active"
            );

        }
    );


    mobileMenu
        ?.querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "active"
                    );

                }
            );

        });


    // ==========================================
    // NEWSLETTER
    // ==========================================

    newsletterForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "emailInput"
                );


            const email =
                emailInput?.value.trim() || "";


            if (!email) return;


            showToast(
                "Welcome to the 99STEPS house."
            );


            newsletterForm.reset();

        }
    );


    // ==========================================
    // ESCAPE KEY
    // ==========================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) return;


            closeSearchBox();

            closeCartDrawer();

            closeProductModal();


            mobileMenu?.classList.remove(
                "active"
            );

        }
    );


    // ==========================================
    // IMAGE NAVIGATION
    // ==========================================

    modalPrev?.addEventListener(
        "click",
        () => {

            if (!selectedProduct) return;


            renderProductVariant(
                selectedVariantIndex - 1
            );

        }
    );


    modalNext?.addEventListener(
        "click",
        () => {

            if (!selectedProduct) return;


            renderProductVariant(
                selectedVariantIndex + 1
            );

        }
    );


    // ==========================================
    // COLOR SELECTION
    // ==========================================

    colorOptions?.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".color-button"
                );


            if (!button) return;


            const index =
                Number(
                    button.dataset.colorIndex
                );


            renderProductVariant(
                index
            );

        }
    );


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    updateCart();


    console.log(
        "99STEPS — Store system loaded."
    );

});