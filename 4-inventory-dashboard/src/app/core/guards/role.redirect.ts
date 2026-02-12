import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { EUserRole } from '../../shared/Enums/UserEnums';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  imports: [CommonModule],
  template: ''
})
export class RoleRedirectComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.handleRedirect();
  }

  private async handleRedirect(): Promise<void> {
    try {
      const auth: any = await firstValueFrom(
        this.authService.checkAuth()
      );

      if (!auth?.status) {
        this.router.navigate(['/auth/login']);
        return;
      }

      const role = auth.data.role;
      console.log(`<<<<< ${role} ${EUserRole.Admin} ${EUserRole.Client} >>>>>`)

      switch (role) {
        case EUserRole.Admin:
        console.log("Going admin");
          this.router.navigate(['/admin']);
          break;

        case EUserRole.Client:
          this.router.navigate(['/client']);
          break;

        default:
          this.router.navigate(['/auth/login']);
          break;
      }

    } catch (error) {
      console.error(error);
      this.router.navigate(['/auth/login']);
    }
  }
}
