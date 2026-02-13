export interface IUserResponse {
    id: number,
    name: string,
    email: string,
    gender: string|null,
    address: string|null,
    phone: string|null,
    role:number,
    status:number,
    createdAt: string,
    updatedAt: string,
    borrows?: any[]
}


export interface IUpdateUserRequest {
    Name: string,
    Gender: string,
    Address: string,
    Phone: string
}

export interface IUpdatePasswordRequest {
    Email: string;
    Password: string|null;
    NewPassword: string;
}

export interface IGetFilteredUserRequest {
    Status: number
    RowCount: number,
    PageNo: number,
    TotalCount?: number,
    BlockedCount?: number,
    ActiveCount?: number,
    SearchString?: string,
}

export interface IGetFilteredUserResponse {
    Status: number,
    RowCount?: number,
    PageNo?: number,
    TotalCount: number,
    BlockedCount: number,
    ActiveCount: number,
    SearchString: string,
    Users: IUserResponse[]
}
