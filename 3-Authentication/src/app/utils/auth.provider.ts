import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ENVIRONMENT } from '../../environment';


@Injectable({
  providedIn: 'root'
})
export class AuthProvider {

  private http = inject(HttpClient);
  private router = inject(Router);

  api_url = 'auth/checkAuth';

  authUser: any = {};

  checkAuth() {
    this.http.get(`${ENVIRONMENT.api_url}${this.api_url}`, {
        withCredentials: true
    })
      .subscribe({
        next: (res: any) => {
          this.authUser = res;
        },
        error: (res) => {
          this.router.navigate(['/login']);
          console.log(res.error.message)
        }
      });
  }
}
