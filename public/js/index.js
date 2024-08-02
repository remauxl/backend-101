import { login , logout} from './login';
import '@babel/polyfill'
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.getElementById('.form');
const logOutBtn = document.getElementById('.nav__el--logout');
const userDataForm = document.getElementById('.form-user-data');
const userPasswordForm = document.getElementById('.form-user-password');



if(mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}



if(loginForm){
    document.querySelector('.form').addEventListener('submit', e=> {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('email').value;
        login(email,password)
    
    });
}

if(logOutBtn){
    logOutBtn.addEventListener('click',logout)
}

if(userDataForm){
    userDataForm.addEventListener('submit', e=> {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        updateSettings({email,name},'data')
    
    });}


if(userPasswordForm){
    userDataForm.addEventListener('submit', async e=> {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updaating...'

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({passwordCurrent,password,passwordConfirm},'password')
    
        document.getElementById('password-current').value='';
        document.getElementById('password').value='';
        document.getElementById('password-confirm').value='';
        document.querySelector('.btn--save-password').textContent = 'Save Password'

    });
}