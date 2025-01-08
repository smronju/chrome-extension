chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fillMarketplaceForm" && request.data) {
        try {
            const product = request.data;

            // Helper function to set value and trigger events
            const setValue = (element, value) => {
                if (element) {
                    element.focus();
                    element.value = value;

                    const inputEvent = new Event("input", {bubbles: true});
                    element.dispatchEvent(inputEvent);

                    const changeEvent = new Event("change", {bubbles: true});
                    element.dispatchEvent(changeEvent);
                } else {
                    console.error("Element not found.");
                }
            };

            // Fill the title
            const productTitle = document.querySelector('label[aria-label="Title"] input');
            setValue(productTitle, product.title);

            // Fill the price
            const productPrice = document.querySelector('label[aria-label="Price"] input');
            setValue(productPrice, product.price);

            // Fill the description
            const productDescription = document.querySelector('label[aria-label="Description"] textarea');

            if (productDescription) {
                setValue(productDescription, product.description);
            }

            // Upload the image
            const imageInput = document.querySelector('input[type="file"]');

            if (imageInput) {
                // Fetch the image from the URL and convert it to a Blob
                fetch(product.thumbnail)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Failed to fetch image from URL");
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        // Create a File object from the Blob
                        const file = new File([blob], `${product.title}.png`, {type: blob.type});

                        if (file.size >= 4 * 1024 * 1024) {
                            console.error("File exceeds the 4 MB size limit.");
                            return;
                        }

                        // Simulate a user-uploaded file
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);

                        imageInput.files = dataTransfer.files;

                        // Dispatch change event to trigger Facebook's file handling
                        const changeEvent = new Event("change", {bubbles: true});
                        imageInput.dispatchEvent(changeEvent);
                    })
                    .catch(error => {
                        console.error("Error handling image upload:", error);
                    });
            } else {
                console.error("Image input element not found.");
            }

            sendResponse({success: true});
        } catch (error) {
            console.error("Error filling form:", error);
            sendResponse({success: false, error: error.message});
        }
    }
});
