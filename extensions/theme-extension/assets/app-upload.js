document.addEventListener("DOMContentLoaded", function() {
  const modalOverlay = document.getElementById("upload-gallery-modal-overlay");
  const modalContainer = document.getElementById("upload-gallery-modal-container");
  const closeModalBtn = document.getElementById("close-upload-gallery-modal");
  const uploadButton = document.getElementById("upload-gallery-button");
  const form = document.getElementById("upload-gallery-form");
  const message = document.getElementById("upload-gallery-message");
  const loginModalContainer = document.getElementById("login-modal-container");

  if (modalOverlay) {
    document.body.appendChild(modalOverlay);
  }
async function waitForTokenAndPopulate() {
  let token = localStorage.getItem("customertoken");
  const maxAttempts = 10;
  let attempts = 0;

  while (!token && attempts < maxAttempts) {
    await new Promise(res => setTimeout(res, 500));
    token = localStorage.getItem("customertoken");
    attempts++;
  }

  if (token) {
    console.log("Token detected by polling. Populating customer fields.");
    populateCustomerFieldsFromToken();
  } else {
    console.warn("Token not found after polling.");
  }
}

waitForTokenAndPopulate();


  
  fetchPastEvents();

  function closeUploadModal() {
    if (modalOverlay) modalOverlay.style.display = "none";
    if (modalContainer) modalContainer.style.display = "none";
  }

  uploadButton?.addEventListener("click", function() {
    const token = localStorage.getItem("customertoken");
    if (token) {
      if (modalContainer) modalContainer.style.display = "block";
      if (modalOverlay) modalOverlay.style.display = "block";
    } else {
      if (loginModalContainer) loginModalContainer.style.display = "block";
    }
  });

  closeModalBtn?.addEventListener("click", closeUploadModal);

  form?.addEventListener("submit", async function(e) {
    e.preventDefault();
    message.textContent = "";
    message.classList.remove("Polaris-Text--success", "Polaris-Text--critical");

    const formData = new FormData(form);

    try {
      const res = await fetch("https://vacations-connect-capital-knit.trycloudflare.com/api/gallery", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        message.textContent = json.message || "Your request is in process.";
        message.classList.add("Polaris-Text--success");
        form.reset();

        setTimeout(() => {
          closeUploadModal();
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

async function populateCustomerFieldsFromToken() {
  let token = localStorage.getItem("customertoken");
  const maxAttempts = 10;
  let attempts = 0;

  while (!token && attempts < maxAttempts) {
    await new Promise(res => setTimeout(res, 200));
    token = localStorage.getItem("customertoken");
    attempts++;
  }

  if (!token) {
    console.error("No customer token found after polling.");
    return;
  }

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
    const res = await fetch("https://netgains28.myshopify.com/api/2025-04/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": "e667bc10b211d8bc9d30c62d919ba267",
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

async function fetchPastEvents() {
  try {
    const res = await fetch("https://vacations-connect-capital-knit.trycloudflare.com/api/gallery");
    const json = await res.json();

    if (json.success && json.events.length > 0) {
      const select = document.getElementById("upload-event");
      select.innerHTML = '<option value="">Select Event</option>';

      const now = new Date();
      json.events
        .filter(event => new Date(event.date) < now)
        .forEach(event => {
          const option = document.createElement("option");
          option.value = event.id;
          option.textContent = `${event.name} (${new Date(event.date).toLocaleDateString()})`;
          select.appendChild(option);
        });
    } else {
      console.warn("No past events found.");
    }
  } catch (error) {
    console.error("Error fetching past events:", error);
  }
}
