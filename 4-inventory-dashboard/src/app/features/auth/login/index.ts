import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../core/services/auth";
import { ILoginData } from "../../../shared/interface/auth";
import { IError } from "../../../shared/interface";
import { ForgotPasswordSchema, LoginSchema, ResetPasswordSchema, VerifyOtpSchema } from "../../../shared/schemas/auth";
import { IftaLabelModule } from "primeng/iftalabel";
import { ButtonModule } from "primeng/button";
import { MessageModule } from "primeng/message";
import { MessageService } from 'primeng/api';
import { DialogModule } from "primeng/dialog";
import { InputOtpModule } from 'primeng/inputotp';


interface IResetData {
    Email: string,
    Otp: string,
    NewPassword: string,
    ConfirmPassword: string
}

@Component({
    selector: "app-login",
    standalone: true,
    imports: [
        RouterLink,
        FormsModule,
        CommonModule,
        IftaLabelModule,
        ButtonModule,
        MessageModule,
        DialogModule,
        InputOtpModule
    ],
    templateUrl: "./index.html",
})
export class Login {

    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private router = inject(Router);


    public isResettingPass = signal<boolean>(false);
    public isLoggingIn = signal<boolean>(false);
    public userRole = signal<string | null>(null)

    public Dialog = signal({
        login: false,
        forgot: false,
        otp: false,
        reset: false
    });

    public ButtonState = signal({
        login: false,
        sendOtp: false,
        verifyOtp: false,
        resetPassword: false
    });

    public resetData = signal<IResetData>({
        Email: "",
        Otp: "",
        NewPassword: "",
        ConfirmPassword: ""
    });
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
    setResetField<K extends keyof IResetData>(key: K, value: string) {
        this.resetData.update(v => ({ ...v, [key]: value }));
    }

    // Dialogs
    openForgot() {
        this.Dialog.set({
            login: false,
            forgot: true,
            otp: false,
            reset: false
        });
    }



    // Send OTP
    handleSendOtp() {
        const result = ForgotPasswordSchema.safeParse(this.resetData());

        if (!result.success) {
            const error = result.error.issues[0];
            this.messageService.add({
                severity: "error",
                summary: "Validation Error",
                detail: error.message
            });
            return;
        }

        const { Email } = result.data;

        this.ButtonState.update(s => ({ ...s, sendOtp: true }));

        this.authService.forgotPassword(Email).subscribe({
            next: (res) => {
                this.messageService.add({
                    severity: "success",
                    summary: "Success",
                    detail: res.message || "OTP sent successfully"
                });

                this.Dialog.update(d => ({
                    ...d,
                    forgot: false,
                    otp: true
                }));

                this.ButtonState.update(s => ({ ...s, sendOtp: false }));
            },
            error: (err) => {
                this.ButtonState.update(s => ({ ...s, sendOtp: false }));
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: err.error?.message || "Failed to send OTP"
                });
            }
        });
    }

    // Verify OTP
    handleVerifyOtp() {
        const result = VerifyOtpSchema.safeParse(this.resetData());

        if (!result.success) {
            const error = result.error.issues[0];
            this.messageService.add({
                severity: "error",
                summary: "Validation Error",
                detail: error.message
            });
            return;
        }

        const { Email, Otp } = result.data;

        this.ButtonState.update(s => ({ ...s, verifyOtp: true }));

        this.authService.verifyOtp(Email, Otp).subscribe({
            next: (res) => {
                this.messageService.add({
                    severity: "success",
                    summary: "Verified",
                    detail: res.message || "OTP Verified"
                });

                this.Dialog.update(d => ({
                    ...d,
                    otp: false,
                    reset: true
                }));

                this.ButtonState.update(s => ({ ...s, verifyOtp: false }));
            },
            error: (err) => {
                this.ButtonState.update(s => ({ ...s, verifyOtp: false }));
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: err.error?.message || "Invalid OTP"
                });
            }
        });
    }

    // Reset Password
    handleResetPassword() {
        const result = ResetPasswordSchema.safeParse(this.resetData());

        if (!result.success) {
            const error = result.error.issues[0];
            this.messageService.add({
                severity: "error",
                summary: "Validation Error",
                detail: error.message
            });
            return;
        }

        const { NewPassword } = result.data;

        this.ButtonState.update(s => ({ ...s, resetPassword: true }));

        this.authService.resetPassword(NewPassword).subscribe({
            next: (res) => {
                this.messageService.add({
                    severity: "success",
                    summary: "Success",
                    detail: res.message || "Password Reset Successful"
                });

                this.Dialog.set({
                    login: false,
                    forgot: false,
                    otp: false,
                    reset: false
                });

                this.resetData.set({
                    Email: "",
                    Otp: "",
                    NewPassword: "",
                    ConfirmPassword: ""
                });

                this.ButtonState.update(s => ({ ...s, resetPassword: false }));
            },
            error: (err) => {
                this.ButtonState.update(s => ({ ...s, resetPassword: false }));
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: err.error?.message || "Reset failed"
                });
            }
        });
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
                    this.messageService.add({ severity: "success", summary: "Success", detail: res.message || "Login Successfull" })
                    this.isLoggingIn.set(false);
                    this.router.navigate([""]);
                },
                error: (err) => {
                    this.isLoggingIn.set(false);
                    this.error.set({
                        Status: true,
                        Message: err.error?.message || "Login failed"
                    });
                }
            });
    }
}
