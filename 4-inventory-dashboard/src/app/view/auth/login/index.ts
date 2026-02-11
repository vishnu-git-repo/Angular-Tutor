import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth";
import { ILoginData } from "../../../utils/interface/auth";
import { IError } from "../../../utils/interface";
import { LoginSchema } from "../../../utils/schemas/auth";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

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
                next: () => {
                    this.router.navigate(["/"]);
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
