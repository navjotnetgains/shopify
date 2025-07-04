document.addEventListener("DOMContentLoaded", function() {
  const loginModalOverlay = document.getElementById("login-modal-overlay");
  const closeModalBtn = document.getElementById("close-login-modal");
  const loginSubmitBtn = document.getElementById("login-submit");
  const loginEmailInput = document.getElementById("login-email");
  const loginPasswordInput = document.getElementById("login-password");
  const loginError = document.getElementById("login-error");
  const loginSuccess = document.getElementById("login-success");

  closeModalBtn.addEventListener("click", function() {
    loginModalOverlay.style.display = "none";
  });

  loginSubmitBtn.addEventListener("click", async function() {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    loginError.style.display = "none";
    loginSuccess.style.display = "none";

    if (!email || !password) {
      loginError.textContent = "Please enter email and password.";
      loginError.style.display = "block";
      return;
    }

    const query = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = { input: { email, password } };

    try {
      const res = await fetch('https://netgains28.myshopify.com/api/2025-04/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': 'e667bc10b211d8bc9d30c62d919ba267',
        },
        body: JSON.stringify({ query, variables }),
      });

      const json = await res.json();
      const data = json.data?.customerAccessTokenCreate;

      if (data?.customerUserErrors.length) {
        loginError.textContent = data.customerUserErrors[0].message;
        loginError.style.display = "block";
      } else {
        const token = data.customerAccessToken.accessToken;
        localStorage.setItem("customertoken", token);
        loginSuccess.style.display = "block";
        loginModalOverlay.style.display = "none";

        const loginEvent = new CustomEvent("loginSuccess");
        document.dispatchEvent(loginEvent);
      }
    } catch (error) {
      loginError.textContent = "An error occurred. Please try again.";
      loginError.style.display = "block";
    }
  });
});