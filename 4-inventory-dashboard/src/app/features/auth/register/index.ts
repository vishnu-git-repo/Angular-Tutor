import { Component, Inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth";
import { IRegisterData } from "../../../shared/interface/auth";
import { IError } from "../../../shared/interface";
import { RegisterSchema } from "../../../shared/schemas/auth";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterLink, FormsModule, CommonModule],
    templateUrl: "./index.html",
})
export class Register {
    private authService = Inject(AuthService);
    private router = Inject(Router);

    public readonly api_url = "auth/register";

    // ✅ MUST be public (template access)
    public re_password = signal<string>("");

    public registerData = signal<IRegisterData>({
        Name: "",
        Email: "",
        Password: "",
        Gender: "",
        Address: "",
        Phone: ""
    });

    public error = signal<IError>({
        Status: false,
        Message: ""
    });

    setField<K extends keyof IRegisterData>(key: K, value: string) {
        this.registerData.update(v => ({ ...v, [key]: value }));
    }

    handleRegister() {
        this.error.set({
            Status: false,
            Message: ""
        })
        const validation = RegisterSchema.safeParse(this.registerData());
        if (!validation.success) {
            this.error.set({
                Status: true,
                Message: validation.error.issues[0].message
            });
            return;
        }

        if (this.registerData().Password !== this.re_password()) {
            this.error.set({
                Status: true,
                Message: "Password and Re-Password do not match",
            });
            return;
        }

        this.authService.Register(this.api_url, this.registerData())
            .subscribe({
                next: () => {
                    this.router.navigate(["/auth/login"]);
                },
                error: (err: any) => {
                    this.error.set({
                        Status: true,
                        Message: err.error?.message || "Registration failed"
                    });
                }
            });
    }
}
