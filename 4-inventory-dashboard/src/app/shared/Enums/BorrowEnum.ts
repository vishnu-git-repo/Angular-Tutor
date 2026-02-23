export enum BorrowStatus
{
    Requested = 1,
    Accepted = 2,
    Assigned = 3,
    Pending = 4,
    Paid = 5,
    Approved = 6,
    Waitlisted = 7,
    Ack = 8,
    Closed = 9
}

export enum PaymentMode
{
    Cash = 1,
    UPI = 2,
    Card = 3,
    BankTransfer = 4,
    NotPaid = 5
}