document.addEventListener("DOMContentLoaded", () => {
  // Create and inject the dialog
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox-dialog";

  const img = document.createElement("img");
  img.className = "lightbox-image";

  dialog.appendChild(img);
  document.body.appendChild(dialog);

  // Close when clicking on the backdrop
  dialog.addEventListener("click", (e) => {
    // If the click target is the dialog itself (the backdrop), close it
    if (e.target === dialog) {
      dialog.close();
    }
  });

  // Attach click handlers to images
  const images = document.querySelectorAll(".screenshot-img");
  images.forEach((image) => {
    image.addEventListener("click", () => {
      img.src = image.src;
      dialog.showModal();
    });
  });
});
