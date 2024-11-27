export const OrderFormWithWrapping = {
    name: 'OrderFormWithWrapping',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'order_form_with_wrapping' ||
      (trace.payload && trace.payload.name === 'order_form_with_wrapping'),
    render: ({ trace, element }) => {
      console.log('Rendering OrderFormWithWrapping');
  
      // Safely parse the payload
      let payloadObj;
      try {
        if (typeof trace.payload === 'string') {
          payloadObj = JSON.parse(trace.payload);
        } else {
          payloadObj = trace.payload || {};
        }
      } catch (error) {
        console.error('Error parsing payload:', error);
        return; // Exit if payload parsing fails
      }
  
      const { filteredWrapping = '[]', lb_quantity = 'Quantity', bt_submit = 'Submit' } = payloadObj;
  
      // Parse wrapping options safely
      let wrappingOptions = [];
      try {
        wrappingOptions = JSON.parse(filteredWrapping);
      } catch (error) {
        console.error('Error parsing filteredWrapping:', error);
      }
  
      // Create form container
      const formContainer = document.createElement('form');
      formContainer.innerHTML = `
        <style>
          .quantity-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
            box-sizing: border-box;
          }
  
          .quantity-container button {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
          }
  
          .quantity-container input {
            width: 40px;
            text-align: center;
            font-size: 16px;
            border: none;
            outline: none;
          }
  
          .wrapping-container {
            display: flex;
            justify-content: space-around;
            gap: 10px;
            margin-bottom: 20px;
          }
  
          .wrapping-item {
            text-align: center;
            cursor: pointer;
            border: 2px solid transparent;
            padding: 5px;
            border-radius: 5px;
            transition: border 0.2s ease-in-out;
          }
  
          .wrapping-item img {
            width: 80px;
            height: 120px;
            object-fit: cover;
            border-radius: 4px;
          }
  
          .wrapping-item.selected {
            border-color: #007BFF;
          }
  
          .wrapping-name {
            font-size: 12px;
            margin-top: 5px;
          }
  
          .submit-button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            box-sizing: border-box;
          }
  
          .submit-button:hover {
            background-color: #45a049;
          }
        </style>
  
        <fieldset>
          <legend>${lb_quantity}:</legend>
          <div class="quantity-container">
            <button type="button" id="decrease">-</button>
            <input type="number" id="quantity" value="1" min="1" readonly>
            <button type="button" id="increase">+</button>
          </div>
        </fieldset>
  
        <fieldset>
          <legend>Select Wrapping (Optional):</legend>
          <div class="wrapping-container">
            ${wrappingOptions
              .map(
                (option, index) => `
              <div class="wrapping-item" data-index="${index}">
                <img src="${option.featuredImageUrl}" alt="${option.productName}">
                <div class="wrapping-name">${option.productName}</div>
                <div class="wrapping-price">€${parseFloat(option.price).toFixed(2)}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </fieldset>
  
        <button type="submit" class="submit-button">
          ${bt_submit}
        </button>
      `;
  
      // Event listeners for quantity adjustment
      const decreaseBtn = formContainer.querySelector('#decrease');
      const increaseBtn = formContainer.querySelector('#increase');
      const quantityInput = formContainer.querySelector('#quantity');
  
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value, 10);
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
        }
      });
  
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value, 10);
        quantityInput.value = currentValue + 1;
      });
  
      // Event listeners for wrapping selection
      let selectedWrapping = null;
      const wrappingItems = formContainer.querySelectorAll('.wrapping-item');
  
      wrappingItems.forEach((item) => {
        item.addEventListener('click', () => {
          wrappingItems.forEach((i) => i.classList.remove('selected'));
          item.classList.add('selected');
          const index = item.getAttribute('data-index');
          selectedWrapping = wrappingOptions[index];
        });
      });
  
      // Event listener for form submission
      formContainer.addEventListener('submit', (event) => {
        event.preventDefault();
  
        const quantity = parseInt(quantityInput.value, 10);
        const payload = {
          quantity,
        };
  
        if (selectedWrapping) {
          payload.wrappingVariantId = selectedWrapping.variantId;
          payload.wrappingQuantity = 1;
        }
  
        // Sending payload to Voiceflow
        window.voiceflow.chat.interact({
          type: 'complete',
          payload,
        });
      });
  
      // Append form container to element
      element.appendChild(formContainer);
    },
  };