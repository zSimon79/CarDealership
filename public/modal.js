document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('messageModal');
  const span = document.querySelector('.modal .close');

  span.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  window.openModal = (message) => {
    console.log('Modal');
    const messageText = document.getElementById('messageText');
    messageText.textContent = message;
    modal.style.display = 'block';
  };
});
