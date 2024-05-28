function updateListingDetailsUI(listingId, data) {
  const detailsDiv = document.getElementById(`details-${listingId}`);
  detailsDiv.innerHTML = `<p>${data.marka} - More details here...</p>`;
  // other details handling
}
// Example client-side script to fetch and update listing details dynamically
document.addEventListener('click', (e) => {
  if (e.target.matches('.listing-detail-link')) {
    const listingId = e.target.dataset.id;
    fetch(`/listings/${listingId}`)
      .then((response) => response.json())
      .then((data) => {
        updateListingDetailsUI(listingId, data);
      })
      .catch((error) => console.error('Error fetching details:', error));
  }
});
