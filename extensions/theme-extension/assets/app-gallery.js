document.addEventListener("DOMContentLoaded", async function() {
  const uploadButton = document.getElementById("upload-gallery-button");
  console.log("Upload Button:", uploadButton);

  const loginModalContainer = document.getElementById("login-modal-container");
  const uploadGalleryModalContainer = document.getElementById("upload-gallery-modal-container");
  

  // Modal open logic
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

  // Approved galleries fetch and render logic
  const galleriesContainer = document.getElementById("approved-galleries-container");

  try {
    const res = await fetch("https://operational-trivia-aluminum-attitudes.trycloudflare.com/api/galleries");
    const data = await res.json();

    if (data.galleries && data.galleries.length > 0) {
      // Create a single container for all images
      const imagesGrid = document.createElement("div");
      imagesGrid.className = "Polaris-Card__Section";
      imagesGrid.style.display = "grid";
      imagesGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 1fr))";
      imagesGrid.style.gap = "10px";

      // Flatten all gallery images and append to the single container
      data.galleries.forEach((gallery) => {
        gallery.images
          .sort((a, b) => a.id - b.id) // optional: sort images by id ascending
          .forEach((img) => {
            const imageEl = document.createElement("img");
            imageEl.src = `https://operational-trivia-aluminum-attitudes.trycloudflare.com${img.url}`;
            imageEl.alt = `Uploaded image ${img.id}`;
            imageEl.style.width = "100%";
            imageEl.style.height = "auto";
            imageEl.style.borderRadius = "8px";
            imageEl.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";

            imagesGrid.appendChild(imageEl);
          });
      });

      // Append the single grid container to your galleries container
      galleriesContainer.innerHTML = ""; // clear loading text
      galleriesContainer.appendChild(imagesGrid);
    } else {
      galleriesContainer.innerHTML = "<p>No approved galleries found.</p>";
    }
  } catch (error) {
    console.error("Error fetching approved galleries:", error);
    galleriesContainer.innerHTML = "<p>Error loading galleries.</p>";
  }
});
