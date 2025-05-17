const apiBase = 'http://localhost:3000/api';

// -------- SIGNUP --------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = signupForm.username.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;

    try {
      const res = await fetch(`${apiBase}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) window.location.href = 'login.html';
    } catch {
      alert('Signup failed. Try again.');
    }
  });
}

// -------- LOGIN --------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    try {
      const res = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) {
        localStorage.setItem('loggedInUser', username);
        window.location.href = 'index.html';
      }
    } catch {
      alert('Login failed. Try again.');
    }
  });
}

// -------- REPORT LOST ITEM --------
const lostForm = document.getElementById('lostForm');
if (lostForm) {
  lostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = lostForm.itemName.value.trim();
    const description = lostForm.itemDescription.value.trim();

    try {
      const res = await fetch(`${apiBase}/items/lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      alert(data.message);
      lostForm.reset();
    } catch {
      alert('Failed to report lost item.');
    }
  });
}

// -------- REPORT FOUND ITEM --------
const foundForm = document.getElementById('foundForm');
if (foundForm) {
  foundForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = foundForm.itemName.value.trim();
    const description = foundForm.itemDescription.value.trim();

    try {
      const res = await fetch(`${apiBase}/items/found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      alert(data.message);
      foundForm.reset();
    } catch {
      alert('Failed to report found item.');
    }
  });
}

// -------- CLAIM PAGE - DISPLAY ITEMS --------
const claimList = document.getElementById('claimList');
if (claimList) {
  fetch(`${apiBase}/items`)
    .then(res => res.json())
    .then(data => {
      const items = data.items;
      if (!items.length) {
        claimList.innerHTML = '<p>No items to claim.</p>';
        return;
      }
      claimList.innerHTML = '';
      items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.name}</strong> (${item.type}): ${item.description}
          <button data-id="${item.id}">Claim</button>
        `;
        claimList.appendChild(li);
      });

      // Add event listeners to claim buttons
      document.querySelectorAll('#claimList button').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          try {
            const res = await fetch(`${apiBase}/items/claim`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });
            const result = await res.json();
            alert(result.message);
            window.location.reload(); // Refresh the list
          } catch {
            alert('Failed to claim item.');
          }
        });
      });
    })
    .catch(() => {
      claimList.innerHTML = '<p>Failed to load items.</p>';
    });
}
// -------- DISPLAY ALL ITEMS (Lost + Found) --------
const allItemsList = document.getElementById('allItemsList');
if (allItemsList) {
  fetch(`${apiBase}/items`)
    .then(res => res.json())
    .then(data => {
      const items = data.items;
      if (!items.length) {
        allItemsList.innerHTML = '<p>No items reported yet.</p>';
        return;
      }
      allItemsList.innerHTML = '';
      items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.name}</strong> (${item.type})<br />
          <em>${item.description}</em>
        `;
        allItemsList.appendChild(li);
      });
    })
    .catch(() => {
      allItemsList.innerHTML = '<p>Failed to load items.</p>';
    });
}

// -------- DISPLAY LOGGED-IN USER ON INDEX --------
const userDisplay = document.getElementById('userDisplay');
if (userDisplay) {
  const username = localStorage.getItem('loggedInUser');
  if (username) {
    userDisplay.textContent = `Welcome, ${username}!`;
  } else {
    userDisplay.textContent = 'Welcome, Guest!';
  }
}
