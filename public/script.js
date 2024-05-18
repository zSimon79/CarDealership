document.getElementById('uploadForm').addEventListener('submit', function submitForm(event) {
  event.preventDefault();
  const formData = new FormData(this);
  const listingId = document.getElementById('listingId').value;
  const actionUrl = `/upload/${listingId}`;

  fetch(actionUrl, {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Hálozati hiba');
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById('message').innerText = data.message;
    })
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('message').innerText = error.message;
    });
});
