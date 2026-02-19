import { EquipmentCategory, EquipmentCondition, EquipmentStatus } from "../../Enums/EquipmentEnums";

export interface ICreateEquipmentsRequest {
    Name: string;
    Description: string;
    Price: number;
    Category: EquipmentCategory;
    Count: number
}

export interface IGetFilteredEquipmentsRequest {
    RowCount: number;
    PageNo: number;
    SearchString: string;
    IsGroup: boolean;
    Condition: number;
    Category: number;
    Status: number;
    EquipmentId?: number;
}


export interface IGetEquipmentGroupItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: number;
    totalItems: number;
    availableCount: number;
    inUseCount: number;
    reservedCount: number;
    maintenanceCount: number;

}
export interface IGetEquipmentGroupResponse {
    items: [{
        id: number;
        name: string;
        description: string;
        price: number;
        category: number;
        totalItems: number;
        availableCount: number;
        inUseCount: number;
        reservedCount: number;
        maintenanceCount: number;
    }],
    totalCount: number;
    categoryCounts: {
        Tools?: number;
        Electronics?: number;
        Vehicles?: number;
        Furniture?: number;
        SafetyGear?: number;
        Other?: number;
    }

}

export interface IGetEquipmentResponse {
    items: [{
        id: number;
        equipmentId: number;
        equipmentName: number;
        description: string;
        price: number;
        condition: EquipmentCondition;
        category: EquipmentCategory;
        status: EquipmentStatus;
        createdAt: string;
        updatedAt: string;
    }];
    totalCount: number;
    statusCounts: {
        Available?: number;
        Reserved?: number;
        InUse?: number;
        UnderMaintenance?: number;
    },
    conditionCounts: {
        New?: number;
        Good?: number;
        Damaged?: number;
        Retired?: number;
    }

}

export interface IGetEquipment {
    id: number;
    equipmentId: number;
    equipmentName: number;
    description: string;
    price: number;
    condition: EquipmentCondition;
    category: EquipmentCategory;
    status: EquipmentStatus;
    createdAt: string;
    updatedAt: string;

}

export interface EquipmentCategoryCounts {
    Tools: number;
    Electronics: number;
    Vehicles: number;
    Furniture: number;
    SafetyGear: number;
    Other: number;
}
export interface EquipmentStatusCounts {
    Available: number;
    Reserved: number;
    InUse?: number;
    UnderMaintenance?: number;
}
export interface EquipmentConditionCounts {
    New?: number;
    Good?: number;
    Damaged?: number;
    Retired?: number;
}
export interface EquipmentResponseCounts {
    Category: EquipmentCategoryCounts;
    Status: EquipmentStatusCounts;
    Condition: EquipmentConditionCounts;
}
export interface dEquipmentResponseCounts{
    Status: EquipmentStatusCounts;
    Condition: EquipmentConditionCounts;
}