document.addEventListener("DOMContentLoaded", function() {
  const uploadButton = document.getElementById("upload-gallery-button");
  console.log("Upload Button:", uploadButton);

  const loginModalContainer = document.getElementById("login-modal-container");
  const uploadGalleryModalContainer = document.getElementById("upload-gallery-modal-container");

  if (uploadButton) {
    uploadButton.addEventListener("click", function() {
      const token = localStorage.getItem('customertoken');

      console.log("Token:", token);

      if (token) {
        uploadGalleryModalContainer.style.display = "block";
      } else {
        loginModalContainer.style.display = "block";
      }
    });
  } else {
    console.log("Upload button not found at DOMContentLoaded");
  }
});
