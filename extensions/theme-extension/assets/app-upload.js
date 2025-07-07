// app-upload.js

document.addEventListener("DOMContentLoaded", function() {
  const modalOverlay = document.getElementById("upload-gallery-modal-overlay");
  const closeModalBtn = document.getElementById("close-upload-gallery-modal");
  const form = document.getElementById("upload-gallery-form");
  const message = document.getElementById("upload-gallery-message");

  // ✅ Populate customer hidden fields from token
  populateCustomerFieldsFromToken();

  closeModalBtn.addEventListener("click", function() {
    modalOverlay.style.display = "none";
  });

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    message.textContent = "";

    const formData = new FormData(form);

    try {
      const res = await fetch("https://operational-trivia-aluminum-attitudes.trycloudflare.com/api/gallery", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        message.textContent = json.message || "Your request is in process.";
        message.classList.add("Polaris-Text--success");
        form.reset();
        setTimeout(() => {
          modalOverlay.style.display = "none";
        }, 2000);
      } else {
        message.textContent = json.error || "Something went wrong.";
        message.classList.add("Polaris-Text--critical");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.textContent = "An error occurred. Please try again.";
      message.classList.add("Polaris-Text--critical");
    }
  });
});

/**
 * ✅ Fetch customer data from token and populate hidden fields
 */
async function populateCustomerFieldsFromToken() {
  let token = localStorage.getItem("customertoken");
  const maxAttempts = 10;
  let attempts = 0;

  while (!token && attempts < maxAttempts) {
    await new Promise(res => setTimeout(res, 200)); // wait 200ms
    token = localStorage.getItem("customertoken");
    attempts++;
  }

  if (!token) {
    console.error("No customer token found after polling.");
    return;
  }

  // existing GraphQL fetch code below
  const query = `
    {
      customer(customerAccessToken: "${token}") {
        id
        firstName
        lastName
        email
      }
    }
  `;

  try {
    const res = await fetch('https://netgains28.myshopify.com/api/2025-04/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': 'e667bc10b211d8bc9d30c62d919ba267',
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();

    if (json.data && json.data.customer) {
      const customer = json.data.customer;
      document.getElementById("upload-customer-id").value = customer.id;
      document.getElementById("upload-customer-name").value = `${customer.firstName} ${customer.lastName}`;
      document.getElementById("upload-customer-email").value = customer.email;

      console.log("✅ Customer fields populated:", customer);
    } else {
      console.error("Customer not found or invalid token", json);
    }

  } catch (error) {
    console.error("Error fetching customer details", error);
  }
}