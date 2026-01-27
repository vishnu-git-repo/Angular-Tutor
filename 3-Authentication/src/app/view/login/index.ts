import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../../../environment';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.html'
})
export class Login {

  constructor(private http: HttpClient) {}

  private router = inject(Router);

  api_url = 'auth/login';

  error = {
    status: false,
    msg: ''
  };

  loginData = {
    email: '',
    password: ''
  };

  login() {
    this.error = {
        status: false,
        msg: ""
    }
    if(this.loginData.email == ""){
        this.error = {
            status: true,
            msg: "Email is required"
        }
        return;
    }
    if(this.loginData.password == ""){
        this.error = {
            status: true,
            msg: "Password is required"
        }
        return;
    }
    this.http.post(`${ENVIRONMENT.api_url}${this.api_url}`, this.loginData, {
        withCredentials: true
    })
    .subscribe({
        next: (res: any) => {
          this.router.navigate(['/'])
        },
        error: err => {
          this.error.status = true;
          this.error.msg = err.error?.message || 'Login failed';
        }
      });
  }
}
