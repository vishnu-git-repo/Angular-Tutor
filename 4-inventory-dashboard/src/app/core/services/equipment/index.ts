import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environment";
import { ICreateEquipmentsRequest, IGetFilteredEquipmentsRequest } from "../../../shared/interface/equipments";




@Injectable({
    providedIn: "root"
})
export class EquipmentService {
    constructor(private http: HttpClient) { }

    createEquipment(payload: ICreateEquipmentsRequest):Observable<any>{
        const api_url = `${environment.api_url}equipments`;
        return this.http.post(api_url, payload, {
            withCredentials: true
        })
    }
    
    getFilteredEquipment(payload: IGetFilteredEquipmentsRequest):Observable<any>{
        const api_url = `${environment.api_url}equipments/filteredequipment`;
        return this.http.post(api_url, payload, {
            withCredentials: true
        })
    }

}