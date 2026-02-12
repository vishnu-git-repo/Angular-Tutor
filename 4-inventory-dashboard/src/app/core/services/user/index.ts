import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { IUpdateUserRequest, IUserResponse } from "../../../shared/interface/users";
import { Observable } from "rxjs";
import { environment } from "../../../../environment";



@Injectable({
    providedIn: "root"
})
export class UserService {
    constructor (private http: HttpClient){}

    createAdmin (api_url: string, data: IUpdateUserRequest): Observable<any>{
        return this.http.put(`${environment.api_url}${api_url}`, data,{
            withCredentials: true
        });
    }

    createClient (api_url: string, data: IUpdateUserRequest): Observable<any>{
        return this.http.put(`${environment.api_url}${api_url}`, data,{
            withCredentials: true
        });
    }

    getUser(api_url:string): Observable<any>{
        return this.http.get(`${environment.api_url}${api_url}`,{
            withCredentials: true
        });
    }

    getAllClient(api_url: string): Observable<any>{
        return this.http.get(`${environment.api_url}${api_url}`,{
            withCredentials: true
        });
    }

    blockClient(api_url: string): Observable<any>{
        return this.http.delete(`${environment.api_url}${api_url}`,{
            withCredentials: true
        });
    }
    unBlockClient(api_url: string): Observable<any>{
        return this.http.delete(`${environment.api_url}${api_url}`,{
            withCredentials: true
        });
    }

    updateUser(api_url: string, data: IUpdateUserRequest): Observable<any>{
        return this.http.put(`${environment.api_url}${api_url}`, data,{
            withCredentials: true
        });
    }
    updatePasswordByAdmin(api_url: string, data: string): Observable<any>{
        return this.http.put(`${environment.api_url}${api_url}`,{
            withCredentials: true
        });
    }
    updatePasswordByClient(api_url: string, data: string): Observable<any>{
        return this.http.put(`${environment.api_url}${api_url}`,{
            withCredentials: true
        });
    }
}