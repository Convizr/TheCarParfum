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
            lb_chooseWrapping,
            selectedVariantTitle = "Default Title",
            selectedVariantID = "",
        } = payloadObj;

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
                * {
                    font-family: Arial, sans-serif;
                }
                label, legend {
                    font-size: 14px;
                    font-weight: normal;
                    display: block;
                    margin-bottom: 5px;
                }
                select, input {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 15px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                    font-size: 14px;
                }
                input[type="submit"] {
                    background-color: #447f76;
                    color: white;
                    border: none;
                    padding: 10px;
                    font-size: 14px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.2s ease;
                }
                input[type="submit"]:hover {
                    background-color: #376b62;
                }
                input:focus, select:focus {
                    outline: 2px solid #447f76;
                    border-color: #447f76;
                }
                .variant-selector {
                    margin: 15px 0;
                }
                .variant-label {
                    font-size: 14px;
                    font-weight: normal;
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
                    padding: 5px;
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
                selectedVariantTitle !== "Default Title" && variantTitlesArray.length > 1
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
                <legend>${lb_chooseWrapping}</legend>
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
            } else if (variantIDsArray.length === 1) {
                // If only one variant exists
                payload.selectedVariantTitle = variantTitlesArray[0];
                payload.selectedVariantID = variantIDsArray[0];
            }

            if (selectedOption) {
                payload.wrappingVariantId = selectedOption.getAttribute('data-variant-id');
                payload.wrappingPrice = parseFloat(selectedOption.getAttribute('data-price'));
                payload.wrappingTitle = selectedOption.getAttribute('data-title');
                payload.wrappingQuantity = 1;
            } else {
                // No wrapping selected
                payload.wrappingVariantId = false;
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


export const SubscriptionForm = {
    name: 'SubscriptionForm',
    type: 'response',
    match: ({ trace }) =>
        trace.type === 'subscription_form' || (trace.payload && trace.payload.name === 'subscription_form'),
    render: ({ trace, element }) => {
        console.log('Rendering SubscriptionForm');

        // Parse the main payload
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

        console.log('Parsed Payload:', payloadObj);

        // Double-parse subscriptionVariantData
        let subscriptionVariantData = payloadObj.subscriptionVariantData;
        if (typeof subscriptionVariantData === 'string') {
            try {
                subscriptionVariantData = JSON.parse(JSON.parse(subscriptionVariantData));
            } catch (e) {
                console.error('Error double-parsing subscriptionVariantData:', e);
                subscriptionVariantData = [];
            }
        }

        console.log('Parsed subscriptionVariantData:', subscriptionVariantData);

        // Check if subscriptionVariantData is now an array
        if (!Array.isArray(subscriptionVariantData)) {
            console.error('subscriptionVariantData is not an array:', subscriptionVariantData);
            return;
        }

        // Extract unique values for dropdowns
        const colors = new Set();
        const scents = new Set();
        const deliveryTimes = new Set();
        const variantMap = new Map();

        subscriptionVariantData.forEach((variant) => {
            const [color, scent, delivery] = variant.subscriptionVariantTitle
                .split(' / ')
                .map((item) => item.trim());
            colors.add(color);
            scents.add(scent);
            deliveryTimes.add(delivery);
            variantMap.set(`${color} / ${scent} / ${delivery}`, {
                id: variant.subscriptionVariantID,
                title: variant.subscriptionVariantTitle,
                price: variant.subscriptionVariantPrice,
            });
        });

        // Convert Sets to Arrays
        const colorOptions = Array.from(colors);
        const scentOptions = Array.from(scents);
        const deliveryOptions = Array.from(deliveryTimes);

        const formContainer = document.createElement('form');

        formContainer.innerHTML = `
            <style>
                label {
                    display: block;
                    margin: 10px 0 5px;
                    font-size: 14px;
                    font-weight: bold;
                }
                select {
                    width: 100%;
                    padding: 8px;
                    margin: 5px 0 20px 0;
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
            </style>

            <fieldset>
                <legend>${payloadObj.lb_quantity || 'Quantity'}:</legend>
                <label for="color">The CarBar:</label>
                <select id="color" name="color" required>
                    ${colorOptions.map((color) => `<option value="${color}">${color}</option>`).join('')}
                </select>

                <label for="scent">Choose your scent:</label>
                <select id="scent" name="scent" required>
                    ${scentOptions.map((scent) => `<option value="${scent}">${scent}</option>`).join('')}
                </select>

                <label for="delivery">Delivery:</label>
                <select id="delivery" name="delivery" required>
                    ${deliveryOptions.map((delivery) => `<option value="${delivery}">${delivery}</option>`).join('')}
                </select>
            </fieldset>

            <input type="submit" value="${payloadObj.bt_submit || 'Submit'}">
        `;

        formContainer.addEventListener('submit', (event) => {
            event.preventDefault();

            // Get selected values
            const selectedColor = formContainer.querySelector('#color').value;
            const selectedScent = formContainer.querySelector('#scent').value;
            const selectedDelivery = formContainer.querySelector('#delivery').value;

            const selectedCombination = `${selectedColor} / ${selectedScent} / ${selectedDelivery}`;
            const variant = variantMap.get(selectedCombination);

            if (!variant) {
                console.error('No matching variant found for selection:', selectedCombination);
                return;
            }

            // Prepare payload
            const payload = {
                selectedColor,
                selectedScent,
                selectedDelivery,
                selectedVariantTitle: variant.title,
                selectedVariantID: variant.id,
                selectedVariantPrice: parseFloat(variant.price), // Add the price
            };

            console.log('Submitting payload:', payload);

            window.voiceflow.chat.interact({
                type: 'complete',
                payload: payload,
            });
        });

        element.appendChild(formContainer);
    },
};

export const PersonalInfoForm = {
    name: 'PersonalInfoForm',
    type: 'response',
    match: ({ trace }) =>
        trace.type === 'personal_info_form' || (trace.payload && trace.payload.name === 'personal_info_form'),
    render: ({ trace, element }) => {
        console.log('Rendering PersonalInfoForm');

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
            lb_email,
            lb_country,
            lb_firstName,
            lb_lastName,
            lb_company,
            lb_streetName,
            lb_houseNumber,
            lb_postalCode,
            lb_city,
            lb_phone,
            bt_submit
        } = payloadObj;

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
            </style>

            <fieldset>
                <legend>Contact</legend>
                <label for="email">${lb_email}</label>
                <input type="email" id="email" name="email" required>
            </fieldset>

            <fieldset>
                <legend>Verzending</legend>
                <label for="country">${lb_country}</label>
                <select id="country" name="country" required>
                    <option value="Netherlands">Nederland</option>
                    <option value="Belgium">België</option>
                    <option value="Germany">Duitsland</option>
                    <!-- Add more countries as needed -->
                </select>
                <label for="firstName">${lb_firstName}</label>
                <input type="text" id="firstName" name="firstName" required>
                <label for="lastName">${lb_lastName}</label>
                <input type="text" id="lastName" name="lastName" required>
                <label for="company">${lb_company}</label>
                <input type="text" id="company" name="company">
                <label for="streetName">${lb_streetName}</label>
                <input type="text" id="streetName" name="streetName" required>
                <label for="houseNumber">${lb_houseNumber}</label>
                <input type="text" id="houseNumber" name="houseNumber" required>
                <label for="postalCode">${lb_postalCode}</label>
                <input type="text" id="postalCode" name="postalCode" required>
                <label for="city">${lb_city}</label>
                <input type="text" id="city" name="city" required>
                <label for="phone">${lb_phone}</label>
                <input type="text" id="phone" name="phone">
            </fieldset>

            <input type="submit" value="${bt_submit || 'Submit'}">
        `;

        // Handle form submission
        formContainer.addEventListener('submit', (event) => {
            event.preventDefault();

            // Collect all input values into the payload
            const payload = {
                email: formContainer.querySelector('#email').value,
                country: formContainer.querySelector('#country').value,
                firstName: formContainer.querySelector('#firstName').value,
                lastName: formContainer.querySelector('#lastName').value,
                company: formContainer.querySelector('#company').value,
                streetName: formContainer.querySelector('#streetName').value,
                houseNumber: formContainer.querySelector('#houseNumber').value,
                postalCode: formContainer.querySelector('#postalCode').value,
                city: formContainer.querySelector('#city').value,
                phone: formContainer.querySelector('#phone').value,
            };

            console.log('Submitting payload:', payload);

            // Send payload to Voiceflow
            window.voiceflow.chat.interact({
                type: 'complete',
                payload: payload,
            });
        });

        element.appendChild(formContainer);
    },
};

export const WaitingAnimationExtension = {
    name: 'WaitingAnimation',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_waitingAnimation' ||
      trace.payload.name === 'ext_waitingAnimation',
    render: async ({ trace, element }) => {
      window.vf_done = true
      await new Promise((resolve) => setTimeout(resolve, 250))
  
      const text = trace.payload?.text || 'I am searching for the best match...'
      const delay = trace.payload?.delay || 3000
  
      const waitingContainer = document.createElement('div')
      waitingContainer.innerHTML = `
        <style>
          .vfrc-message--extension-WaitingAnimation {
            background-color: transparent !important;
            background: none !important;
          }
          .waiting-animation-container {
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 300;
            color: #fffc;
            display: flex;
            align-items: center;
          }
          .waiting-text {
            display: inline-block;
            margin-left: 10px;
          }
          .waiting-letter {
            display: inline-block;
            animation: shine 1s linear infinite;
          }
          @keyframes shine {
            0%, 100% { color: #fffc; }
            50% { color: #000; }
          }
          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #fffc;
            border-top: 2px solid #000;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <div class="waiting-animation-container">
          <div class="spinner"></div>
          <span class="waiting-text">${text
            .split('')
            .map((letter, index) =>
              letter === ' '
                ? ' '
                : `<span class="waiting-letter" style="animation-delay: ${
                    index * (1000 / text.length)
                  }ms">${letter}</span>`
            )
            .join('')}</span>
        </div>
      `
  
      element.appendChild(waitingContainer)
  
      window.voiceflow.chat.interact({
        type: 'continue',
      })
  
      let intervalCleared = false
      window.vf_done = false
  
      const checkDoneInterval = setInterval(() => {
        if (window.vf_done) {
          clearInterval(checkDoneInterval)
          waitingContainer.style.display = 'none'
          window.vf_done = false
        }
      }, 100)
  
      setTimeout(() => {
        if (!intervalCleared) {
          clearInterval(checkDoneInterval)
          waitingContainer.style.display = 'none'
        }
      }, delay)
    },
  }
  
  // This extension triggers a "done" action,
  // typically used to signal the completion of a task
  // and hide a previous WaitingAnimation
  export const DoneAnimationExtension = {
    name: 'DoneAnimation',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_doneAnimation' ||
      trace.payload.name === 'ext_doneAnimation',
    render: async ({ trace, element }) => {
      window.vf_done = true
      await new Promise((resolve) => setTimeout(resolve, 250))
  
      window.voiceflow.chat.interact({
        type: 'continue',
      })
    },
  }