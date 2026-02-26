import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environment";
import { IAcceptBorrowRequest, IGetAdminBorrowRequest, IGetClientBorrowRequest, IReqBorrowRequest } from "../../../shared/interface/borrows";



@Injectable({
    providedIn: "root"
})
export class BorrowService {
    constructor(private http: HttpClient) { }

    getBorrowByID(id: number): Observable<any> {
        const api_url = `${environment.api_url}borrows/${id}`;
        return this.http.get(api_url, {
            withCredentials: true
        });
    }

    getAdminBorrows(payload: IGetAdminBorrowRequest): Observable<any> {
        const api_url = `${environment.api_url}borrows/adminBorrows`;
        return this.http.post(api_url, payload, {
            withCredentials: true
        });
    }

    getClientBorrows(payload: IGetClientBorrowRequest): Observable<any> {
        const api_url = `${environment.api_url}borrows/clientBorrows`;
        return this.http.post(api_url, payload, {
            withCredentials: true
        });
    }

    postRequestBorrow(payload: IReqBorrowRequest): Observable<any> {
        const api_url = `${environment.api_url}borrows/request`;
        return this.http.post(api_url, payload, {
            withCredentials: true
        })
    }

    postAssignBorrow(payload: IReqBorrowRequest): Observable<any> {
        const api_url = `${environment.api_url}borrows/assign`;
        return this.http.post(api_url, payload, {
            withCredentials: true
        })
    } 

    putAcceptBorrow(payload: IAcceptBorrowRequest): Observable<any> {
        const api_url = `${environment.api_url}borrows/accept/${payload.BorrowId}`;
        return this.http.put(api_url, payload, {
            withCredentials: true
        })
    }

}