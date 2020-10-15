import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
// Getting locations from the map dataset and displaying map
const mapBox = JSON.parse(document.getElementById('map'));

const form = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateInfoForm = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-password');

if (mapBox) {
  const locations = mapBox.dataset.locations;
  displayMap(locations);
}

// Getting Login Data
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (updateInfoForm) {
  console.log('Hello');

  updateInfoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const frm = new FormData();
    frm.append('name', document.getElementById('name').value);
    frm.append('email', document.getElementById('email').value);
    frm.append('photo', document.getElementById('photo').files[0]);
    console.log(frm);
    updateSettings(frm, 'data');
  });
}
if (updatePassword) {
  updatePassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating....';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

    document.querySelector('.btn--save-password').textContent = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
