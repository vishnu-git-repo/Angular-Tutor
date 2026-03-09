export interface IAdminInsightCounts {
  user: IUserCounts;
  equipment: IEquipmentCounts;
  borrow: IBorrowCounts;
}

export interface IClientInsightCounts {
  borrow: IBorrowCounts;
}

export interface IUserCounts {
  total: number;
  status: UserStatusCounts;
}

export interface UserStatusCounts {
  Active: number;
  Inactive: number;
}

export interface IEquipmentCounts {
  total: number;
  status: IEquipmentStatusCounts;
  condition: IEquipmentConditionCounts;
}

export interface IEquipmentStatusCounts {
  Available: number;
  Reserved: number;
  UnderMaintenance: number;
  InUse: number;
}

export interface IEquipmentConditionCounts {
  New: number;
  Damaged: number;
  Retired: number;
  Good: number;
}

export interface IBorrowCounts {
  total: number;
  status: BorrowStatusCounts;
}

export interface BorrowStatusCounts {
  Requested: number;
  Accepted: number;
  Assigned: number;
  Pending: number;
  Paid: number;
  Approved: number;
  Waitlisted: number;
  Ack: number;
  Closed: number;
}