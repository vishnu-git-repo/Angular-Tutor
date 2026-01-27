export interface IUser {
    name: string;
    email: string;
    password: string;
    phone: string;
    dob: Date;
    _id?: string;
    created_at?: Date;
    updated_at?: Date;
}