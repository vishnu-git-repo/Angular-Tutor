import { BorrowStatus, PaymentMode } from "../../Enums/BorrowEnum";

// PUBLIC
export interface IGetAdminBorrowRequest {
    RowCount: number;
    PageNo: number;
    Status: number;
    EquipmentId: number;
    EquipmentItemId: number;
    UserId: number;
    SearchString: string;
    BorrowId: number;
    TotalCount: number;
}

export interface IReqBorrowRequest {
    UserId: number;
    StartDate: string;
    ExpectedReturnDate: string;
    Items: IRequestBorrowItems[];
}

export interface IRequestBorrowItems {
    EquipmentId: number;
    Quantity: number;
}


export interface IAcceptBorrowRequest {
    BorrowId: number;
    UserId: number;
    PreRemarks: string;
}



export interface IGetBorrowByIDResponse {
    borrow: IBorrowDetail;
    equipments: IEquipmentDetail[]
}



// PRIVATE
interface IBorrowDetail {
    userId: number;
    userName: string;
    userEmail: string;
    borrowId: number;
    borrowStatus: BorrowStatus;
    equipmentCounts: number;
    startDate: string;
    expectedReturnDate: string;
    actualReturnDate: string | null;
    totalPrice: number;
    paidAmount: number;
    dueAmount: number;
    lateFee: number;
    paymentMode: PaymentMode;
    isPaymentCompleted: boolean;
    paymentId: string | null;
    requestedDate: string;
    acceptedDate: string | null;
    assignedDate: string | null;
    pendingDate: string | null;
    paidDate: string | null;
    approvedDate: string | null;
    waitlistedDate: string | null;
    ackDate: string | null;
    closedDate: string | null;
    preRemarks: string | null;
    postRemarks: string | null;
    ackRemarks: string | null;
    createdAt: string;
    updatedAt: string;
}

interface IEquipmentDetail {
    equipmentId: number;
    equipmentName: string;
    equipmentDescription: string;
    equipmentItemId: number;
    borrowedPrice: number;
    isReturned: boolean;
}


