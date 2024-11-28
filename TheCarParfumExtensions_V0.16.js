export const OrderFormWithWrapping = {
    name: 'OrderFormWithWrapping',
    type: 'response',
    match: ({ trace }) =>
        trace.type === 'order_form_with_wrapping' || (trace.payload && trace.payload.name === 'order_form_with_wrapping'),
    render: ({ trace, element }) => {
        console.log('Rendering OrderFormWithWrapping');

        // Parse payload
        let payloadObj;
        if (typeof trace.payload === 'string') {
            try {
                payloadObj = JSON.parse(trace.payload);
            } catch (e) {
                console.error('Error parsing payload:', e);
                payloadObj = {};
            }
        } else {
            payloadObj = trace.payload || {};
        }

        // Extract variables from the payload
        const {
            filteredWrapping = [],
            lb_quantity,
            bt_submit,
            selectedVariantTitle,
            selectedVariantID,
        } = payloadObj;

        console.log('Raw Payload:', trace.payload);
        console.log('Parsed Payload:', payloadObj);

        const variantTitlesArray = selectedVariantTitle
            ? selectedVariantTitle.split(',').map((title) => title.trim())
            : [];
        const variantIDsArray = selectedVariantID
            ? selectedVariantID.split(',').map((id) => id.trim())
            : [];

        const formContainer = document.createElement('form');

        formContainer.innerHTML = `
            <style>
                label {
                    display: block;
                    margin: 10px 0 5px;
                    font-size: 14px;
                    font-weight: bold;
                }
                input, select {
                    width: 100%;
                    padding: 8px;
                    margin: 5px 0 20px 0;
                    display: inline-block;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                input[type="submit"] {
                    background-color: #447f76;
                    color: white;
                    border: none;
                    padding: 10px;
                    font-size: 16px;
                    text-align: center;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }
                input[type="submit"]:hover {
                    background-color: #376b62;
                }
                .variant-selector {
                    margin: 15px 0;
                }
                .variant-label {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 5px;
                    display: inline-block;
                }
                .wrapping-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    justify-content: center;
                }
                .wrapping-option {
                    text-align: center;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: 2px solid transparent;
                    border-radius: 8px;
                }
                .wrapping-option img {
                    width: 100px;
                    height: 100px;
                    object-fit: cover;
                    border-radius: 8px;
                }
                .wrapping-option.selected {
                    border-color: #447f76;
                    box-shadow: 0 0 10px #447f76;
                    transform: scale(1.05);
                }
                .wrapping-option span {
                    display: block;
                    margin-top: 5px;
                    font-size: 14px;
                }
            </style>

            <fieldset>
                <legend>${lb_quantity}:</legend>
                <label for="quantity">${lb_quantity}:</label>
                <input type="number" id="quantity" name="quantity" value="1" min="1" required>
            </fieldset>

            ${
                variantTitlesArray.length > 0 &&
                variantTitlesArray[0] !== 'No additional variants'
                    ? `
                <fieldset class="variant-selector">
                    <label class="variant-label">The CarBar:</label>
                    <span id="variantLabel">${variantTitlesArray[0]}</span>
                    <select id="variantDropdown" name="variant" required>
                        ${variantTitlesArray
                            .map(
                                (title, index) => `
                                <option value="${variantIDsArray[index]}">${title}</option>
                            `
                            )
                            .join('')}
                    </select>
                </fieldset>
                `
                    : ''
            }

            <fieldset>
                <legend>Choose Wrapping (Optional):</legend>
                <div class="wrapping-options">
                    ${
                        filteredWrapping.length > 0
                            ? filteredWrapping
                                  .map(
                                      (wrap) => `
                                <div class="wrapping-option" data-variant-id="${wrap.variantId}" data-price="${wrap.price}" data-title="${wrap.productName}">
                                    <img src="${wrap.featuredImageUrl}" alt="${wrap.productName}">
                                    <span>${wrap.productName}</span>
                                    <span>€${wrap.price}</span>
                                </div>
                            `
                                  )
                                  .join('')
                            : '<p>No wrapping options available.</p>'
                    }
                </div>
            </fieldset>

            <input type="submit" value="${bt_submit}">
        `;

        // Add interactivity for wrapping selection
        const wrappingOptions = formContainer.querySelectorAll('.wrapping-option');
        let selectedOption = null;

        wrappingOptions.forEach((option) => {
            option.addEventListener('click', () => {
                if (selectedOption === option) {
                    option.classList.remove('selected');
                    selectedOption = null;
                } else {
                    if (selectedOption) selectedOption.classList.remove('selected');
                    option.classList.add('selected');
                    selectedOption = option;
                }
            });
        });

        // Interactivity for variant dropdown
        const variantDropdown = formContainer.querySelector('#variantDropdown');
        const variantLabel = formContainer.querySelector('#variantLabel');

        if (variantDropdown) {
            variantDropdown.addEventListener('change', () => {
                const selectedIndex = variantDropdown.selectedIndex;
                variantLabel.textContent = variantTitlesArray[selectedIndex];
            });
        }

        // Handle form submission
        formContainer.addEventListener('submit', (event) => {
            event.preventDefault();

            const quantity = parseInt(formContainer.querySelector('#quantity').value, 10);
            const payload = {
                quantity: quantity,
            };

            if (variantDropdown) {
                const selectedVariantIndex = variantDropdown.selectedIndex;
                payload.selectedVariantTitle = variantTitlesArray[selectedVariantIndex];
                payload.selectedVariantID = variantDropdown.value;
            }

            if (selectedOption) {
                payload.wrappingVariantId = selectedOption.getAttribute('data-variant-id');
                payload.wrappingPrice = parseFloat(selectedOption.getAttribute('data-price'));
                payload.wrappingTitle = selectedOption.getAttribute('data-title');
                payload.wrappingQuantity = 1;
            }

            console.log('Submitting payload:', payload);

            window.voiceflow.chat.interact({
                type: 'complete',
                payload: payload,
            });
        });

        element.appendChild(formContainer);
    },
};