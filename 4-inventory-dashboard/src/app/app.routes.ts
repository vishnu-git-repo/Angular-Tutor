import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Login } from './features/auth/login';
import { Register } from './features/auth/register';
import { EUserRole } from './shared/Enums/UserEnums';

import { AdminDashboard } from './features/admin/layout';
import { AdminUserComponent } from './features/admin/pages/user';
import { AdminEquipmentComponent } from './features/admin/pages/equipment';
import { AdminInsightComponent } from './features/admin/pages/insight';
import { AdminBorrowComponent } from './features/admin/pages/borrows';

import { ClientDashboard } from './features/client/layout';
import { ClientEquipmentComponent } from './features/client/pages/equipment';
import { ClientInsightComponent } from './features/client/pages/insight';
import { ClientBorrowComponent } from './features/client/pages/borrow';

export const routes: Routes = [

  
  { path: 'login', component: Login },
  { path: 'register', component: Register },


  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./core/guards/role.redirect').then(m => m.RoleRedirectComponent)
  },

  
  // Admin Layout
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: EUserRole.Admin },
    children: [
      { path: 'insight', component: AdminInsightComponent },
      { path: 'users', component: AdminUserComponent },
      { path: 'equipments', component: AdminEquipmentComponent },
      {
        path: 'borrows',
        component: AdminBorrowComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: EUserRole.Admin },
      },
      { path: '', redirectTo: 'insight', pathMatch: 'full' }
    ]
  },

  // Client Layout
  {
    path: 'client',
    component: ClientDashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: EUserRole.Client },
    children: [
      { path: 'insight', component: ClientInsightComponent },
      { path: 'equipments', component: ClientEquipmentComponent },
      { path: 'borrows', component: ClientBorrowComponent },
      { path: '', redirectTo: 'user', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
