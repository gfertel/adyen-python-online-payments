const clientKey = document.getElementById("clientKey").innerHTML;
const { AdyenCheckout, Affirm } = window.AdyenWeb;

// Function to create AdyenCheckout instance
async function createAdyenCheckout(session) {
  return AdyenCheckout({
    session: session,
    clientKey,
    environment: "test",
    amount: {
      value: 10000,
      currency: 'EUR'
    },
    locale: "en_US",
    countryCode: 'NL',
    showPayButton: true,
    onPaymentCompleted: (result, component) => {
      console.info("onPaymentCompleted", result, component);
      handleOnPaymentCompleted(result.resultCode);
    },
    onPaymentFailed: (result, component) => {
      console.info("onPaymentFailed", result, component);
      handleOnPaymentFailed(result.resultCode);
    },
    onError: (error, component) => {
      console.error("onError", error.name, error.message, error.stack, component);
      window.location.href = "/result/error";
    },
  });
}

// Function to handle payment completion redirects
function handleOnPaymentCompleted(resultCode) {
  switch (resultCode) {
    case "Authorised":
      window.location.href = "/result/success";
      break;
    case "Pending":
    case "Received":
      window.location.href = "/result/pending";
      break;
    default:
      window.location.href = "/result/error";
      break;
  }
}

// Function to handle payment failure redirects
function handleOnPaymentFailed(resultCode) {
  switch (resultCode) {
    case "Cancelled":
    case "Refused":
      window.location.href = "/result/failed";
      break;
    default:
      window.location.href = "/result/error";
      break;
  }
}

// Function to start checkout
async function startCheckout() {
    const session = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(response => response.json());

    const affirmConfiguration = {
      visibility: {
          personalDetails: "hidden", // These fields will not appear on the payment form.
          billingAddress: "readOnly", // These fields will appear on the payment form,
                                    //but the shopper cannot edit them.
          deliveryAddress: "editable" // These fields will appear on the payment form,
                                    // and the shopper can edit them.
                                    // This is the default behavior.
      }
    };

  const dropinConfiguration = {
  // ...  other required configuration
  paymentMethodsConfiguration: {
    affirm: affirmConfiguration
  }
};

    const checkout = await createAdyenCheckout(session);
    const affirm = new Affirm(checkout, {
      type: "affirm",
      useAffirmWidget: false,
    }).mount('#component-container');

}

startCheckout();
