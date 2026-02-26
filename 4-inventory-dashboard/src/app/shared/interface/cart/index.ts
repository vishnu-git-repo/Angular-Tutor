import { IGroupEquipmentItems } from "../equipments";
import { IUserResponse } from "../users";

export interface ClientCartItem {
    Equipment: IGroupEquipmentItems|null,
    Quantity: number
}

export interface AdminStore {
    User: IUserResponse|null, 
    Equipments: AdminStoreItem[]
}

export interface AdminStoreItem {
    Equipment: IGroupEquipmentItems|null,
    Quantity: number
}
