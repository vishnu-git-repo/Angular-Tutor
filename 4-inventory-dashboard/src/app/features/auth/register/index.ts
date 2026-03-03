import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth";
import { IRegisterData } from "../../../shared/interface/auth";
import { IError } from "../../../shared/interface";
import { RegisterSchema } from "../../../shared/schemas/auth";
import { IftaLabelModule } from "primeng/iftalabel";
import { SelectModule } from "primeng/select";
import { ButtonModule } from "primeng/button";
import { MessageModule } from 'primeng/message';

@Component({
    selector: "app-register",
    standalone: true,
    imports: [
        RouterLink,
        FormsModule,
        CommonModule,
        IftaLabelModule,
        SelectModule,
        ButtonModule,
        MessageModule
    ],
    templateUrl: "./index.html",
})
export class Register {
    private authService = inject(AuthService);
    private router = inject(Router);

    public re_password = signal<string>("");

    public registerData = signal<IRegisterData>({
        Name: "",
        Email: "",
        Password: "",
        Gender: "",
        Address: "",
        Phone: ""
    });

    public isRegistering = signal<boolean>(false)

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

        this.isRegistering.set(true);

        this.authService.register(this.registerData())
            .subscribe({
                next: (res: any) => {
                    this.router.navigate(["/auth/login"]);
                    this.isRegistering.set(false);
                },
                error: (err: any) => {
                    this.error.set({
                        Status: true,
                        Message: err.error?.message || "Registration failed"
                    });
                    this.isRegistering.set(false);
                }
            });
    }
}
