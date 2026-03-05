import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { ICheckAuthResponse, ILoginData, IRegisterData } from "../../../shared/interface/auth";
import { environment } from "../../../../environment";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  constructor(private http: HttpClient) { }

  public User = signal<ICheckAuthResponse | null>(null);

  login(data: ILoginData): Observable<any> {
    const api_url = `${environment.api_url}auth/login`
    return this.http.post(
      api_url,
      data,
      { withCredentials: true }
    );
  }

  register(data: IRegisterData): Observable<any> {
    const api_url = `${environment.api_url}auth/register`
    return this.http.post(
      api_url,
      data,
      { withCredentials: true }
    );
  }

  checkAuth(): Observable<any> {
    return this.http.get(
      `${environment.api_url}auth/me`,
      { withCredentials: true }
    ).pipe(
      tap((res: any) => {
        if (res?.status) {
          this.User.set(res.data);
        } else {
          this.User.set(null);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${environment.api_url}auth/forgot-password`,
      { Email: email },
      { withCredentials: true }
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(
      `${environment.api_url}auth/verify-otp`,
      { Email: email, Otp: otp },
      { withCredentials: true }
    );
  }

  resetPassword(newPassword: string): Observable<any> {
    return this.http.post(
      `${environment.api_url}auth/reset-password`,
      { NewPassword: newPassword },
      { withCredentials: true }
    );
  }


  logout(): Observable<any> {
    return this.http.get(
      `${environment.api_url}auth/logout`,
      { withCredentials: true }
    )
  }

  isLoggedIn() {
    return !!this.User();
  }

  getRole() {
    return this.User()?.role;
  }

  getUser() {
    if (!this.User()) {
      this.checkAuth();
      return this.User();
    }
    return this.User();
  }
}
