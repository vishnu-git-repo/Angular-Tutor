import { Component, signal, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import {TooltipModule} from "primeng/tooltip";
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    DrawerModule,
    ButtonModule,
    CommonModule,
    RouterModule,
    TooltipModule,
    AvatarModule
  ],
  templateUrl: './index.html'
})
export class ClientDashboard implements OnInit{

  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarVisible = signal(false);
  sidebarExpanded = signal(false);
  isMobile = signal(false);
  user = signal<any>(null);

  ngOnInit(): void {
    this.user.set(this.authService.getUser());
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  constructor() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile.set(window.innerWidth < 768);
    
    if (this.isMobile()) {
      this.sidebarExpanded.set(false);
    }
  }

  toggleSidebar() {
    this.sidebarVisible.set(true);
  }

  closeSidebar() {
    this.sidebarVisible.set(false);
  }

  // NEW METHOD: Toggle sidebar expanded state
  toggleSidebarExpanded() {
    this.sidebarExpanded.update(v => !v);
  }

  // Only expand on hover for desktop
  onSidebarHover() {
    if (!this.isMobile()) {
      this.sidebarExpanded.set(true);
    }
  }

  onSidebarLeave() {
    if (!this.isMobile()) {
      this.sidebarExpanded.set(false);
    }
  }

  // For mobile, toggle the PrimeNG drawer
  toggleMobileMenu() {
    if (this.isMobile()) {
      this.toggleSidebar();
    }
  }

  handleLogout () {
    this.authService.logout()
    .subscribe({
      next: (res) => {
        this.router.navigate([""]);
      },
      error : e => console.log(Error)
    })
  }
}