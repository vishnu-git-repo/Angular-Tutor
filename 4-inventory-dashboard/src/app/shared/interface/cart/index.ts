import { IGroupEquipmentItems } from "../equipments";

export interface ClientCartItem {
    Equipment: IGroupEquipmentItems|null,
    Quantity: number
}
