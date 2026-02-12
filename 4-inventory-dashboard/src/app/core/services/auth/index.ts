import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { ILoginData, IRegisterData } from "../../../shared/interface/auth";
import { environment } from "../../../../environment";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  constructor(private http: HttpClient) {}

  private user = signal<any | null>(null);

  login(apiUrl: string, data: ILoginData): Observable<any> {
    return this.http.post(
      `${environment.api_url}${apiUrl}`,
      data,
      { withCredentials: true }
    );
  }

  register(apiUrl: string, data: IRegisterData): Observable<any> {
    return this.http.post(
      `${environment.api_url}${apiUrl}`,
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
          this.user.set(res.data);
        } else {
          this.user.set(null);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.get(
      `${environment.api_url}auth/logout`,
      { withCredentials: true}
    )
  }

  isLoggedIn() {
    return !!this.user();
  }

  getRole() {
    return this.user()?.role;
  }

  getUser() {
    if(!this.user()){
      this.checkAuth();
      return this.user();
    }
    return this.user();
  }
}
