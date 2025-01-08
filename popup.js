document.addEventListener("DOMContentLoaded", () => {
    const loadingIndicator = document.getElementById("loading");
    const productList = document.getElementById("product-list");
    const errorMessage = document.getElementById("error-message");

    // Step 1: Fetch the list of products
    const fetchProductList = () => {
        loadingIndicator.style.display = "block";
        productList.innerHTML = "";
        errorMessage.style.display = "none";

        chrome.runtime.sendMessage({action: "fetchProductList"}, response => {
            loadingIndicator.style.display = "none";

            if (response.success) {
                response.data.products.forEach(product => {
                    // Create the card div
                    const cardDiv = document.createElement("div");
                    cardDiv.classList.add("card");

                    // Card header
                    const cardHeader = document.createElement("div");
                    cardHeader.classList.add("card-header");
                    cardHeader.textContent = product.title;

                    // Create and set the product image
                    const cardImg = document.createElement("img");
                    cardImg.src = product.thumbnail;
                    cardImg.classList.add("card-img-top");
                    cardImg.alt = product.title; // Use the title as alt text

                    // Create the card body
                    const cardBody = document.createElement("div");
                    cardBody.classList.add("card-body");

                    // Create and add product description (optional)
                    const cardText = document.createElement("p");
                    cardText.classList.add("card-text");
                    cardText.textContent = product.description;


                    const cardFooter = document.createElement("div");
                    cardFooter.classList.add("card-footer", "text-center");

                    const cardFooterButton = document.createElement("button");
                    cardFooterButton.classList.add("btn", "btn-primary");
                    cardFooterButton.textContent = "Select Product";

                    // Append elements to card body
                    cardBody.appendChild(cardText);

                    // Append elements to card footer
                    cardFooter.appendChild(cardFooterButton);

                    // Append elements to card
                    cardDiv.appendChild(cardHeader);
                    cardDiv.appendChild(cardImg);
                    cardDiv.appendChild(cardBody);
                    cardDiv.appendChild(cardFooter);

                    // Add click event to fetch product details when the card is clicked
                    cardFooterButton.addEventListener("click", () => fetchProductDetails(product.id));

                    // Append the card to the product list
                    productList.appendChild(cardDiv);
                });
            } else {
                errorMessage.textContent = `Error fetching product list: ${response.error}`;
                errorMessage.style.display = "block";
            }
        });
    };


    // Step 2: Fetch product details
    const fetchProductDetails = productId => {
        loadingIndicator.style.display = "block";
        errorMessage.style.display = "none";

        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            const activeTab = tabs[0];

            // Check if the active tab's URL matches Facebook Marketplace
            if (activeTab.url.includes("facebook.com/marketplace")) {
                chrome.runtime.sendMessage({action: "fetchProductDetails", productId}, response => {
                    loadingIndicator.style.display = "none";

                    if (response.success) {
                        const product = response.data;

                        // Send the product details to the content script to fill the form
                        chrome.tabs.sendMessage(activeTab.id, {
                            action: "fillMarketplaceForm",
                            data: product
                        }, msgResponse => {
                            if (chrome.runtime.lastError) {
                                console.error("Error communicating with content script:", chrome.runtime.lastError.message);
                                alert("Failed to communicate with the content script. Please ensure you're on the Facebook Marketplace page.");
                            } else {
                                console.log("Product details sent successfully:", msgResponse);
                            }
                        });
                    } else {
                        errorMessage.textContent = `Error fetching product details: ${response.error}`;
                        errorMessage.style.display = "block";
                    }
                });
            } else {
                loadingIndicator.style.display = "none";
                alert("Please navigate to Facebook Marketplace before selecting a product.");
            }
        });
    };

    // Start by fetching the product list
    fetchProductList();
});
