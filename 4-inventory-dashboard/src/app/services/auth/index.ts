import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ILoginData, IRegisterData } from "../../utils/interface/auth";
import { environment } from "../../../environment";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(apiUrl: string, data: ILoginData): Observable<any> {
    return this.http.post(
      environment+apiUrl,
      data,
      { withCredentials: true }
    );
  }

  register(apiUrl: string, data: IRegisterData): Observable<any> {
    return this.http.post(
        environment+apiUrl,
        data,
        { withCredentials: true}
    )
  }
}
