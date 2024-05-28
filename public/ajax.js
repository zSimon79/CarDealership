/* eslint-disable no-unused-vars */
/* exported loadDetails, deleteImage */
function loadDetails(listingId) {
  const detailsDiv = document.getElementById(`details-${listingId}`);

  if (detailsDiv.innerHTML !== '') {
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
    return;
  }

  fetch(`/listings/${listingId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      const content = `
              <p>City: ${data.varos}</p>
              <p>Date: ${new Date(data.datum).toISOString().slice(0, 10)}</p>
              <p>Fuel Type: ${data.motor}</p>
              <a href="/listings/details/${listingId}">Részletek</a>
          `;
      detailsDiv.innerHTML = content;
      detailsDiv.style.display = 'block';
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      detailsDiv.innerHTML = '<p>Error loading details. Please try again.</p>';
      detailsDiv.style.display = 'block';
    });
}

function deleteImage(imageId, imageIndex) {
  fetch(`/listings/images/delete/${imageId}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const imageElement = document.getElementById(`image-${imageIndex}`);
        imageElement.parentNode.removeChild(imageElement);
        alert('Kép sikeresen törölve!');
      } else {
        alert(`Hiba történt a kép törlésekor: ${data.message}`);
      }
    })
    .catch((error) => {
      console.error('Hiba a kép törlésekor', error);
      alert('Hiba történt a kép törlésekor.');
    });
}
