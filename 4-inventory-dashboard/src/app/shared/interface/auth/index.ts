export interface ILoginData {
    Email: string;
    Password: string;
}

export interface IRegisterData {
    Name: string;
    Email: string;
    Password: string;
    Gender: string;
    Address: string;
    Phone: string;
}

export interface ICheckAuthResponse {
    id: number,
    name: string,
    email: string,
    gender: string,
    address: string,
    phone: string,
    role: number,
    status: number
}