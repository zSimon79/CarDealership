window.onload = function successMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    alert('Listázás létrehozva!');
  }
};
