import { Routes } from '@angular/router';
import { Login } from './view/login';
import { Register } from './view/register';
import { Home } from './view/home';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'register', component: Register },
    { path: 'login', component: Login}
];
