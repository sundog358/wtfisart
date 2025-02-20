document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const artworkCards = document.querySelectorAll(".artwork-card");
  const modal = document.getElementById("artworkModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalArtist = document.getElementById("modalArtist");
  const modalYear = document.getElementById("modalYear");
  const modalMedium = document.getElementById("modalMedium");
  const closeModal = document.querySelector(".close-modal");

  // Filter functionality
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter artwork cards
      artworkCards.forEach((card) => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Modal functionality
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const card = e.target.closest(".artwork-card");
      const image = card.querySelector("img");
      const title = card.querySelector("h3").textContent;
      const description = card.querySelector("p").textContent;

      // Update modal content
      modalImage.src = image.src;
      modalImage.alt = image.alt;
      modalTitle.textContent = title;
      modalDescription.textContent = description;

      // Example data - in production, this would come from your database
      modalArtist.textContent = "Digital Artist Name";
      modalYear.textContent = "2024";
      modalMedium.textContent = "Digital / Generated";

      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    });
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  // Close modal on outside click
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});
