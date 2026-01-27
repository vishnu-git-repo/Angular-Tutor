import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ENVIRONMENT } from '../../../environment';




@Component({
    selector:'app-root',
    standalone: true,
    templateUrl: './register.html', 
    imports: [RouterLink, FormsModule, CommonModule]
})

export class Register{

    constructor(private http: HttpClient){}
    api_url = "auth/register"

    re_password = "";
    error = {
        status: false,
        msg: ""
    }
    registerData = {
        name: "",
        email: "",
        password: "",
        phone: "",
        dob: ""
    }
    register(){
        this.error = {
            status: false,
            msg: ""
        }
        if (this.registerData.password != this.re_password) {
            this.error.status=true,
            this.error.msg = "Re-Password must be same as password"
            return
        }
        this.http.post(`${ENVIRONMENT.api_url}${this.api_url}`, this.registerData,{
            withCredentials: true
        })
        .subscribe({
            next: res=> console.log(res),
            error: res=> {
                this.error.status = true,
                this.error.msg = res.error?.message || "Register failed"
            }
        })
    }
}