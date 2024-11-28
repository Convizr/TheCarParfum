export const OrderFormWithWrapping = {
    name: 'OrderFormWithWrapping',
    type: 'response',
    match: ({ trace }) =>
        trace.type === 'order_form_with_wrapping' || (trace.payload && trace.payload.name === 'order_form_with_wrapping'),
    render: ({ trace, element }) => {
        console.log('Rendering OrderFormWithWrapping');

        // Log raw payload for debugging
        console.log('Raw Payload:', trace.payload);

        // Parse payload with improved error handling
        let payloadObj;
        try {
            if (typeof trace.payload === 'string') {
                payloadObj = JSON.parse(trace.payload);
            } else {
                payloadObj = trace.payload || {};
            }
        } catch (error) {
            console.error('Error parsing payload:', error.message);
            console.error('Raw payload data:', trace.payload);
            payloadObj = {}; // Default to an empty object
        }

        console.log('Parsed Payload:', payloadObj);

        // Extracting variables from the payload
        const {
            filteredWrapping = [], // Assumes filteredWrapping is an array
            lb_quantity = payloadObj.lb_quantity || 'Quantity', // Label for quantity
            bt_submit = payloadObj.bt_submit || 'Submit', // Label for submit button
        } = payloadObj;

        console.log('Raw filteredWrapping from payload:', filteredWrapping);

        // Check if filteredWrapping is already an array
        const wrappingOptions = Array.isArray(filteredWrapping) ? filteredWrapping : [];
        console.log('Parsed filteredWrapping:', wrappingOptions);

        // Create the form container
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
                .wrapping-option {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                    cursor: pointer;
                }
                .wrapping-option input {
                    margin-right: 10px;
                }
                .wrapping-option img {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    margin-right: 10px;
                }
                .wrapping-option label {
                    font-size: 14px;
                    font-weight: normal;
                    margin: 0;
                }
            </style>

            <fieldset>
                <legend>${lb_quantity || 'Select Quantity'}:</legend>
                <label for="quantity">${lb_quantity || 'Quantity'}:</label>
                <input type="number" id="quantity" name="quantity" value="1" min="1" required>
            </fieldset>

            <fieldset>
                <legend>Choose Wrapping (Optional):</legend>
                ${
                    wrappingOptions.length > 0
                        ? wrappingOptions
                              .map(
                                  (wrap, index) => `
                            <div class="wrapping-option">
                                <input type="radio" id="wrap-${index}" name="wrapping" value="${wrap.variantId}" data-price="${wrap.price}">
                                <img src="${wrap.featuredImageUrl}" alt="${wrap.productName}">
                                <label for="wrap-${index}">
                                    ${wrap.productName} (€${wrap.price})
                                </label>
                            </div>
                          `
                              )
                              .join('')
                        : '<p>No wrapping options available.</p>'
                }
            </fieldset>

            <input type="submit" value="${bt_submit || 'Submit'}">
        `;

        // Handle form submission
        formContainer.addEventListener('submit', (event) => {
            event.preventDefault();

            const quantity = parseInt(formContainer.querySelector('#quantity').value, 10);
            const selectedWrapping = formContainer.querySelector('input[name="wrapping"]:checked');

            // Prepare the payload to send back
            const payload = {
                quantity: quantity,
            };

            if (selectedWrapping) {
                payload.wrappingVariantId = selectedWrapping.value;
                payload.wrappingPrice = parseFloat(selectedWrapping.getAttribute('data-price'));
            }

            console.log('Submitting payload:', payload);

            window.voiceflow.chat.interact({
                type: 'complete',
                payload: payload,
            });
        });

        // Add the form container to the element
        element.appendChild(formContainer);
    },
};