chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Fetch list of products
    if (request.action === "fetchProductList") {
        fetch("https://dummyjson.com/products")
            .then(response => response.json())
            .then(data => sendResponse({success: true, data}))
            .catch(error => sendResponse({success: false, error}));

        return true;
    }

    // Fetch specific product details
    if (request.action === "fetchProductDetails" && request.productId) {
        fetch(`https://dummyjson.com/products/${request.productId}`)
            .then(response => response.json())
            .then(data => sendResponse({success: true, data}))
            .catch(error => sendResponse({success: false, error}));

        return true;
    }
});
