import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { IGetFilteredUserRequest, IUpdatePasswordRequest, IUpdateUserRequest, IUserResponse } from "../../../shared/interface/users";
import { Observable } from "rxjs";
import { environment } from "../../../../environment";



@Injectable({
    providedIn: "root"
})
export class UserService {
    constructor(private http: HttpClient) { }

    createAdmin(data: IUpdateUserRequest): Observable<any> {
        const api_url = "users/create/admin";
        return this.http.put(`${environment.api_url}${api_url}`, data, {
            withCredentials: true
        });
    }
    createClient(data: IUpdateUserRequest): Observable<any> {
        const api_url = "users/create/client";
        return this.http.put(`${environment.api_url}${api_url}`, data, {
            withCredentials: true
        });
    }
    getFilteredClient(data: IGetFilteredUserRequest): Observable<any> {
        const api_url = "users/filterclient"
        return this.http.post(`${environment.api_url}${api_url}`, data, {
            withCredentials: true
        });
    }


    getUser(id: number): Observable<any> {
        const api_url = `users/${id}`;
        return this.http.get(`${environment.api_url}${api_url}`, {
            withCredentials: true
        });
    }
    getAllClient(): Observable<any> {
        const api_url = "users";
        return this.http.get(`${environment.api_url}${api_url}`, {
            withCredentials: true
        });
    }

    updateUser(id: number, data: IUpdateUserRequest): Observable<any> {
        const api_url = `users/${id}`;
        return this.http.put(`${environment.api_url}${api_url}`, data, {
            withCredentials: true
        });
    }
    updatePasswordByAdmin(id: number, data: IUpdatePasswordRequest): Observable<any> {
        const api_url = `users/password/changeByAdmin/${id}`;
        return this.http.put(`${environment.api_url}${api_url}`, data, {
            withCredentials: true
        });
    }
    updatePasswordByClient(id: number, data: IUpdatePasswordRequest): Observable<any> {
        const api_url = `users/password/changeByClient/${id}`;
        return this.http.put(`${environment.api_url}${api_url}`, data, {
            withCredentials: true
        });
    }


    blockClient(id: number): Observable<any> {
        const api_url = `users/disable/${id}`;
        return this.http.delete(`${environment.api_url}${api_url}`, {
            withCredentials: true
        });
    }
    unBlockClient(id: number): Observable<any> {
        const api_url = `users/enable/${id}`;
        return this.http.delete(`${environment.api_url}${api_url}`, {
            withCredentials: true
        });
    }
}