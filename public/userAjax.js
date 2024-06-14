function deleteUser(userId) {
  fetch(`/users/${userId}`, { method: 'DELETE' })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Nem sikerült törölni a felhasználót.');
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);

      if (data.message === 'Felhasználó törölve és kijelentkeztetve.') {
        window.location.href = '/login/logout';
      }

      const userElement = document.getElementById(`user-${userId}`);
      if (userElement) {
        userElement.remove();
      }
    })
    .catch((error) => {
      console.error('Hiba a felhasználó törlésekor:', error);
      alert('Hiba történt a felhasználó törlésekor.');
    });
}

function confirmUserDeletion(userId) {
  const modal = document.getElementById('confirmationModal');
  modal.style.display = 'block';
  window.handleDelete = function del(confirm) {
    if (confirm) {
      deleteUser(userId);
    }
    modal.style.display = 'none';
  };
}

function createUserItem(user) {
  const li = document.createElement('li');
  li.id = `user-${user.felhasznaloID}`;
  li.className = 'offerList';

  const userInfo = document.createElement('p');
  userInfo.textContent = `${user.nev} - ${user.szerep}`;
  li.appendChild(userInfo);

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Törlés';
  deleteButton.onclick = () => confirmUserDeletion(user.felhasznaloID);
  deleteButton.className = 'deleteUserButton';
  deleteButton.setAttribute('data-user-id', user.felhasznaloID);
  li.appendChild(deleteButton);

  return li;
}
function loadUsers(name = '', role = '') {
  fetch(`/users/list?name=${encodeURIComponent(name)}&role=${encodeURIComponent(role)}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    })
    .then((users) => {
      const userList = document.getElementById('userList');
      userList.textContent = '';
      users.forEach((user) => {
        userList.appendChild(createUserItem(user));
      });
    })
    .catch((error) => {
      console.error('Error loading users:', error);
      alert('Error loading users');
    });
}

document.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const role = document.getElementById('role').value;

  loadUsers(name, role);
});

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  console.log('DOM loaded');
  const deleteButtons = document.querySelectorAll('.deleteUserButton');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const userId = event.target.getAttribute('data-user-id');
      confirmUserDeletion(userId);
    });
  });
});
