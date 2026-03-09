import { BorrowStatus } from "../../Enums/BorrowEnum";
import { PaymentMode, PaymentStatus } from "../../Enums/PaymentEnum";
import { EUserRole } from "../../Enums/UserEnums";

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
    Description: string;
}

export interface IAssignBorrowRequest {
    UserId: number;
    StartDate: string;
    ExpectedReturnDate: string;
    Items: IRequestBorrowItems[];
    Description: string;
}

export interface IRequestBorrowItems {
    EquipmentId: number;
    Quantity: number;
}


export interface IAcceptBorrowRequest {
    BorrowId: number;
    UserId: number;
    Description: string;
}

export interface IPendingBorrowRequest {
    BorrowId: number;
    UserId: number;
    Description: string;
}

export interface IPaidBorrowRequest {
    UserId: number;
    PaymentMode: number;
    Description: string;
    RazorpayOrderId: string;
    RazorpayPaymentId: string;
    RazorpaySignature: string;
}

export interface IAdminPaymentRequest {
    BorrowId: number;
    UserId: number;
    PaidAmount: number;
    Description: string;
}

export interface IApproveBorrowRequest {
    BorrowId: number,
    UserId: number,
    Description: string
}

export interface IWaitlistBorrowRequest {
    BorrowId: number,
    UserId: number,
    Description: string
}

export interface IAckBorrowRequest {
    BorrowId: number,
    UserId: number,
    Description: string
}

export interface IClosedBorrowRequest {
    BorrowId: number,
    UserId: number,
    Description: string
}

export interface IGetBorrowByIDResponse {
    borrow: IBorrowDetail;
    equipments: IEquipmentDetail[];
    payment: IPaymentLog[];
    borrowLogs: IBorrowLogs[]
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
    id: number;
    userRole: EUserRole;
    statusFrom: BorrowStatus;
    statusTo: BorrowStatus;
    action: string;
    description: string;
    createdAt: string;
}

interface IPaymentLog {
    id: number;
    paymentMode: PaymentMode;
    status: PaymentStatus;
    price: number;
    razorPayOrderId: number;
    razorPayPaymentId: number;
    paymentInitiatedDate: string;
    paymentCompletedDate: string;
    user: {
        id: number,
        name: string,
        email: string,
        phone: string
    }
}


