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
    borrows: any[]
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
    RePassword: string;
}