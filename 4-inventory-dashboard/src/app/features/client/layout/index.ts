import { Component, signal, HostListener } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    DrawerModule,
    ButtonModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './index.html'
})
export class ClientDashboard {
  sidebarVisible = signal(false);
  sidebarExpanded = signal(false);
  isMobile = signal(false);
  
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
}