import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environment";



@Injectable({
    providedIn: "root"
})
export class InsightService {
    constructor(private http: HttpClient) { }

    getAdminInsightCounts(): Observable<any> {
        const api_url = `${environment.api_url}insight/admin`;
        return this.http.get(api_url,{
            withCredentials: true
        })
    }

    getClientInsightCounts(id: number): Observable<any> {
        const api_url = `${environment.api_url}insight/client/${id}`;
        return this.http.get(api_url,{
            withCredentials: true
        })
    }
}