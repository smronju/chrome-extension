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

            const selectCategory = (categoryName, defaultCategory = 'Tools') => {
                // Step 1: Find and click the category dropdown button
                const categoryButton = document.querySelector('[aria-label="Category"]');

                if (!categoryButton) {
                    console.error("Category button not found.");
                    return;
                }

                categoryButton.click(); // Open the dropdown

                // Wait for dropdown options to load
                setTimeout(() => {
                    // Step 2: Find the category list
                    const categoryList = document.querySelector('[aria-label="Dropdown menu"]');

                    if (!categoryList) {
                        console.error("Category list not found.");
                        return;
                    }

                    // Step 3: Loop through category items and select the right one
                    const categoryItems = categoryList.querySelectorAll('[role="button"]');
                    let matchedCategory = null;
                    let defaultCategoryItem = null;

                    for (let item of categoryItems) {
                        let categoryText = item.innerText.trim().toLowerCase();

                        if (categoryText === categoryName.toLowerCase()) {
                            matchedCategory = item;
                        }

                        // Fallback to default category.
                        if (categoryText === defaultCategory.toLowerCase()) {
                            defaultCategoryItem = item;
                        }
                    }

                    // Step 4: Click the matched category or fallback to default
                    if (matchedCategory) {
                        matchedCategory.click();
                        console.log(`Category "${categoryName}" selected.`);
                    } else if (defaultCategoryItem) {
                        defaultCategoryItem.click();
                        console.warn(`Category "${categoryName}" not found. Defaulting to "${defaultCategory}".`);
                    } else {
                        console.error(`Neither category "${categoryName}" nor default "${defaultCategory}" found.`);
                    }
                }, 1000);
            };

            // Fill the title
            const productTitle = document.querySelector('label[aria-label="Title"] input');
            setValue(productTitle, product.title);

            // Fill the price
            const productPrice = document.querySelector('label[aria-label="Price"] input');
            setValue(productPrice, product.price);

            // Set Category (Dropdown)
            selectCategory(product.category);


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
