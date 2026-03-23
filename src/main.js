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

  // Handle info dialogs triggers
  const triggers = document.querySelectorAll(".term-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const dialogId = trigger.getAttribute("data-dialog");
      const infoDialog = document.getElementById(dialogId);
      if (infoDialog) {
        infoDialog.showModal();
      }
    });
  });

  // Close info dialogs when clicking outside
  const infoDialogs = document.querySelectorAll(".info-dialog");
  infoDialogs.forEach((dialog) => {
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = rect.top <= e.clientY && e.clientY <= rect.top + rect.height && rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        dialog.close();
      }
    });
  });
});
