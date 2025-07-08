document.addEventListener("DOMContentLoaded", async function() {
  const uploadButton = document.getElementById("upload-gallery-button");
  const loginModalContainer = document.getElementById("login-modal-container");
  const uploadGalleryModalContainer = document.getElementById("upload-gallery-modal-container");
  const galleriesContainer = document.getElementById("approved-galleries-container");
  const filterContainer = document.getElementById("event-filter-container");

  // Modal open logic
  if (uploadButton) {
    uploadButton.addEventListener("click", function() {
      const token = localStorage.getItem('customertoken');
      if (token) {
        uploadGalleryModalContainer.style.display = "block";
      } else {
        loginModalContainer.style.display = "block";
      }
    });
  }

  try {
    // Fetch both all events and approved images from your API
    const res = await fetch("https://vacations-connect-capital-knit.trycloudflare.com/api/galleries");
    const data = await res.json();

    // Assuming your API now returns { images: [...], events: [...] }
    const events = data.events || [];
    const images = data.images || [];

    if (events.length > 0) {
      // Render "All" button
      const allBtn = document.createElement("button");
allBtn.className = "Polaris-Button Polaris-Button--primary";
allBtn.textContent = "All";

allBtn.style.background = "#ff4d4f";
allBtn.style.color = "white";
allBtn.style.padding = "10px 16px";
allBtn.style.borderRadius = "6px";
allBtn.style.fontWeight = "bold";
allBtn.style.fontSize = "13px";
allBtn.style.marginRight = "10px";

allBtn.onclick = () => renderImages(images);
filterContainer.appendChild(allBtn);


      // Render each event button
      events.forEach(event => {
  const btn = document.createElement("button");
  btn.className = "Polaris-Button Polaris-Button--primary";
  btn.textContent = event.name;
  
  // Style same as Upload Gallery button
  btn.style.background = "#ff4d4f";
  btn.style.color = "white";
  btn.style.padding = "10px 16px";
  btn.style.borderRadius = "6px";
  btn.style.fontWeight = "bold";
  btn.style.fontSize = "13px";
  btn.style.marginRight = "10px"; // spacing between buttons

  btn.onclick = () => {
    const filtered = images.filter(img => img.gallery.event.id === event.id);
    renderImages(filtered, event.name);
  };
  filterContainer.appendChild(btn);
});

    } else {
      filterContainer.innerHTML = "<p>No events found.</p>";
    }

    // Render all images initially
    renderImages(images);
  } catch (error) {
    console.error("Error fetching data:", error);
    galleriesContainer.innerHTML = "<p>Error loading images.</p>";
  }

  function renderImages(images, eventName = "") {
    galleriesContainer.innerHTML = "";
    if (images.length === 0) {
      galleriesContainer.innerHTML = `<p>No approved images found${eventName ? ' for ' + eventName : ''}.</p>`;
      return;
    }

    images.forEach((img) => {
      const imageEl = document.createElement("img");
      imageEl.src = `https://vacations-connect-capital-knit.trycloudflare.com${img.url}`;
      imageEl.alt = `Uploaded image ${img.id}`;
      imageEl.style.width = "500%";
      imageEl.style.height = "100%";
      imageEl.style.borderRadius = "8px";
      imageEl.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
      imageEl.style.maxWidth = "300px";
       imageEl.style.minWidth = "500px";
      galleriesContainer.appendChild(imageEl);
    });
  }
});
