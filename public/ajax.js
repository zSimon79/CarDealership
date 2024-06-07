function addDetails(data, detailsDiv, listingId) {
  detailsDiv.textContent = '';

  const cityP = document.createElement('p');
  cityP.textContent = `Város: ${data.varos}`;
  detailsDiv.appendChild(cityP);

  const dateP = document.createElement('p');
  dateP.textContent = `Dátum: ${new Date(data.datum).toISOString().slice(0, 10)}`;
  detailsDiv.appendChild(dateP);

  const fuelP = document.createElement('p');
  fuelP.textContent = `Motor: ${data.motor}`;
  detailsDiv.appendChild(fuelP);

  const detailsLink = document.createElement('a');
  detailsLink.href = `/listings/details/${listingId}`;
  detailsLink.textContent = 'Részletek';
  detailsDiv.appendChild(detailsLink);
}

function loadDetails(listingId) {
  const detailsDiv = document.getElementById(`details-${listingId}`);

  if (detailsDiv.innerHTML !== '') {
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
    return;
  }

  fetch(`/listings/${listingId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Hálózati hiba');
      }
      return response.json();
    })
    .then((data) => {
      addDetails(data, detailsDiv, listingId);
      detailsDiv.style.display = 'block';
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      detailsDiv.textContent = 'Hiba a részletek betöltésében.';
      detailsDiv.style.display = 'block';
    });
}

function deleteImage(imageId) {
  fetch(`/listings/images/delete/${imageId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (response.ok) {
        const imageElement = document.getElementById(`image-${imageId}`);
        imageElement.parentNode.removeChild(imageElement);
        alert('Kép sikeresen törölve!');
      } else {
        response.text().then((text) => alert(`Hiba történt a kép törlésekor: ${text}`));
      }
    })
    .catch((error) => {
      console.error('Hiba a kép törlésekor', error);
      alert('Hiba történt a kép törlésekor.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const listingItems = document.querySelectorAll('.listing-item');
  listingItems.forEach((item) => {
    item.addEventListener('click', () => {
      const listingId = item.getAttribute('data-listing-id');
      loadDetails(listingId);
    });
  });

  const deleteButtons = document.querySelectorAll('.deleteButton');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const imageId = button.getAttribute('data-image-id');
      console.log('Gomb', imageId);
      deleteImage(imageId);
    });
  });
});
