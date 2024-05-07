export function uploadImage(event) {
  event.preventDefault();

  const listingId = document.getElementById('listingId').value;
  const imageFile = document.getElementById('imageFile').files[0];

  if (!listingId || !imageFile) {
    alert('Please fill in all fields and select an image.');
    return;
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  fetch(`/upload/${listingId}`, {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => alert(`Upload Successful: ${JSON.stringify(data)}`))
    .catch((error) => console.error('Error:', error));
}
