    import { Routes } from '@angular/router';
    import { Register } from './view/auth/register';
    import { Login } from './view/auth/login';

    export const routes: Routes = [
        { path: 'auth/register', component: Register },
        { path: 'auth/login', component: Login}
    ];
