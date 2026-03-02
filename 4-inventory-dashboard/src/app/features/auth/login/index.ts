import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../core/services/auth";
import { ILoginData } from "../../../shared/interface/auth";
import { IError } from "../../../shared/interface";
import { LoginSchema } from "../../../shared/schemas/auth";
import { IftaLabelModule } from "primeng/iftalabel";
import { ButtonModule } from "primeng/button";
import { MessageModule } from "primeng/message";

@Component({
    selector: "app-login",
    standalone: true,
    imports: [
        RouterLink,
        FormsModule, 
        CommonModule,
        IftaLabelModule,
        ButtonModule,
        MessageModule
    ], 
    templateUrl: "./index.html",
})
export class Login {

    private authService = inject(AuthService);
    private router = inject(Router);

    public isLoggingIn = signal<boolean>(false);
    public userRole = signal<string|null>(null)
    public loginData = signal<ILoginData>({
        Email: "",
        Password: ""
    });
    public error = signal<IError>({
        Status: false,
        Message: ""
    });

    setField<K extends keyof ILoginData>(key: K, value: string) {
        this.loginData.update(v => ({ ...v, [key]: value }));
    }

    handleLogin() {
        const validation = LoginSchema.safeParse(this.loginData());

        if (!validation.success) {
            this.error.set({
                Status: true,
                Message: validation.error.issues[0].message
            });
            return;
        }

        this.isLoggingIn.set(true);
        this.authService.login(this.loginData())
            .subscribe({
                next: (res) => {
                    this.isLoggingIn.set(false);
                    this.router.navigate([""]);
                },
                error: (err) => {
                    this.isLoggingIn.set(false);
                    console.log(err)
                    this.error.set({
                        Status: true,
                        Message: err.error?.message || "Login failed"
                    });
                }
            });
    }
}
