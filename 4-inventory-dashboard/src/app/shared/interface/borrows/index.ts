import { BorrowStatus } from "../../Enums/BorrowEnum";
import { PaymentMode, PaymentStatus } from "../../Enums/PaymentEnum";

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

export interface IGetClientBorrowRequest {
    RowCount: number;
    PageNo: number;
    Status: number;
    SearchString: string;
    UserId: any;
    TotalCount: number;
}

export interface IReqBorrowRequest {
    UserId: number;
    StartDate: string;
    ExpectedReturnDate: string;
    Items: IRequestBorrowItems[];
}

export interface IAssignBorrowRequest {
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

export interface IPendingBorrowRequest {
    BorrowId: number;
    UserId: number
}

export interface IPaidBorrowRequest {

}


export interface IGetBorrowByIDResponse {
    borrow: IBorrowDetail;
    equipments: IEquipmentDetail[];
    payments : IPaymentLog[];
    borrowLogs : IBorrowLogs[]
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
    isPaymentCompleted: boolean;
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

interface IBorrowLogs {
    id : number;
    status : BorrowStatus;
    description : string;
    createdAt : string;
}

interface IPaymentLog {
    id : number;
    paymentMode : PaymentMode;
    status : PaymentStatus;
    razorPayOrderId : number;
    razorPayPaymentId : number;
    paymentInitiatedDate : string;
    paymentCompletedDate : string;
}


