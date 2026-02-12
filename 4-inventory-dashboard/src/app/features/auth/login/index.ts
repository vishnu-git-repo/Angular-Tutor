import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../core/services/auth";
import { ILoginData } from "../../../shared/interface/auth";
import { IError } from "../../../shared/interface";
import { LoginSchema } from "../../../shared/schemas/auth";

@Component({
    selector: "app-login",
    standalone: true,
    imports: [RouterLink, FormsModule, CommonModule], 
    templateUrl: "./index.html",
})
export class Login {

    private authService = inject(AuthService);
    private router = inject(Router);

    public readonly api_url = "auth/login";

    public isLoggedIn = signal<boolean>(false);
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

        this.authService.login(this.api_url, this.loginData())
            .subscribe({
                next: (res) => {
                    console.log("Redirecting>>>>>")
                    this.router.navigate([""]);
                },
                error: (err) => {
                    this.error.set({
                        Status: true,
                        Message: err.error?.message || "Login failed"
                    });
                }
            });
    }
}
