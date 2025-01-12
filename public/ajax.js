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

function deleteListing(listingId) {
  fetch(`/listings/${listingId}`, { method: 'DELETE' })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Nem sikerült törölni a listázást.');
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);

      if (data.message === 'Listázás törölve') {
        window.location.href = '../../listings';
      }
    })
    .catch((error) => {
      console.error('Hiba a listázás törlésekor:', error);
      alert('Hiba történt a listázás törlésekor.');
    });
}

function confirmListingDeletion(listingId) {
  const modal = document.getElementById('confirmationModal');
  modal.style.display = 'block';
  window.handleDelete = function del(confirm) {
    if (confirm) {
      deleteListing(listingId);
    }
    modal.style.display = 'none';
  };
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
      deleteImage(imageId);
    });
  });

  const deleteListingButton = document.getElementById('deleteListing');
  deleteListingButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const listingId = deleteListingButton.getAttribute('data-listing-id');
    confirmListingDeletion(listingId);
  });
});

function openModal(message) {
  const messageText = document.getElementById('messageText');
  messageText.textContent = message;
  document.getElementById('messageModal').style.display = 'block';
}

function fetchWithModal(url, options = {}) {
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Modal hiba');
      }
      return response.json();
    })
    .then((data) => {
      if (data.message) {
        openModal(data.message);
      }
      return data;
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      openModal('Modal hiba.');
    });
}

function handleOfferDecision(offerId, decision) {
  fetchWithModal(`/listings/offers/${offerId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ decision }),
  })
    .then((data) => {
      const statusElement = document.getElementById(`offerStatus-${offerId}`);
      statusElement.textContent = `Státusz: ${data.decision}`;

      statusElement.className = '';
      statusElement.classList.add(`status-${data.decision.replace(/ /g, '')}`);
    })
    .catch((error) => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
  const decisionButtons = document.querySelectorAll('.offer-decision');

  decisionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const offerId = button.getAttribute('data-offer-id');
      const decision = button.getAttribute('data-decision');
      handleOfferDecision(offerId, decision);
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('offerForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const offerValue = formData.get('offer');

      const listingId = form.getAttribute('data-listing-id');

      fetchWithModal(`/listings/${listingId}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offer: offerValue }),
      }).catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while sending the offer.');
      });
    });
  }
});
