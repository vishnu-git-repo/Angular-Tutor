import { HttpClient } from "@angular/common/http";
import { Injectable} from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environment";
import { IGetAdminBorrowRequest } from "../../../shared/interface/borrows";





@Injectable({
    providedIn: "root"
})
export class BorrowService {
    constructor(private http: HttpClient) { }

    getAdminBorrows(payload: IGetAdminBorrowRequest):Observable<any>{
            const api_url = `${environment.api_url}borrows/adminBorrows`;
            return this.http.post(api_url, payload, {
                withCredentials: true
            })
        }

}