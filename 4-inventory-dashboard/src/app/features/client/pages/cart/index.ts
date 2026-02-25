import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ClientCartItem } from "../../../../shared/interface/cart";
import { ButtonModule } from "primeng/button";
import { AuthService } from "../../../../core/services/auth";
import { DialogModule } from "primeng/dialog";
import { IftaLabelModule } from "primeng/iftalabel";
import { DatePicker, DatePickerModule } from "primeng/datepicker";
import { IReqBorrowRequest } from "../../../../shared/interface/borrows";
import { FormsModule } from "@angular/forms";
import { BorrowService } from "../../../../core/services/borrow";

@Component({
    selector: "app-client-cart",
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        ButtonModule,
        DialogModule,
        IftaLabelModule,
        DatePickerModule,
    ],
    templateUrl: "./index.html",
})
export class ClientCartComponent implements OnInit {
    private authservice = inject(AuthService);
    private borrowService = inject(BorrowService)
    public CartItems = signal<ClientCartItem[]>([]);
    public User = signal<any>(null);
    public Dialog = signal<{ checkOut: boolean }>({ checkOut: false });

    public requestPayload = signal<IReqBorrowRequest>({
        UserId: 0,
        StartDate: "",
        ExpectedReturnDate: "",
        Items: [],
    });

    public datePickerValues = signal<{ StartDate: Date; ExpectedReturnDate: Date }>({
        StartDate: new Date(),
        ExpectedReturnDate: new Date(),
    });

    public minStartDate: Date = new Date();
    public minReturnDate: Date = new Date();

    ngOnInit(): void {
        this.loadCartFromStorage();

        this.User = this.authservice.User;
        if (!this.User()) {
            this.authservice.checkAuth().subscribe();
        }

        const today = new Date();
        this.datePickerValues.update((state) => ({
            StartDate: today,
            ExpectedReturnDate: today,
        }));

        this.requestPayload.update((state) => ({
            ...state,
            UserId: this.User().id,
        }));

        window.addEventListener("storage", (event) => {
            if (event.key === "clientCart") {
                this.loadCartFromStorage();
            }
        });
    }

    loadCartFromStorage() {
        try {
            const storedCart = localStorage.getItem("clientCart");
            if (storedCart !== null) {
                const parsedCart: ClientCartItem[] = JSON.parse(storedCart);
                this.CartItems.set(parsedCart);
            } else {
                this.CartItems.set([]);
            }
        } catch (error) {
            console.error("Error loading cart from localStorage:", error);
            this.CartItems.set([]);
        }
    }

    updateQuantity(item: ClientCartItem, change: number) {
        if (!item.Equipment) return;

        const newQty = item.Quantity + change;
        item.Quantity = Math.max(1, Math.min(newQty, item.Equipment.availableCount));

        this.CartItems.set([...this.CartItems()]);
        localStorage.setItem("clientCart", JSON.stringify(this.CartItems()));
    }

    removeItem(item: ClientCartItem) {
        const updated = this.CartItems().filter((i) => i !== item);
        this.CartItems.set(updated);
        localStorage.setItem("clientCart", JSON.stringify(updated));
    }

    clearCart() {
        this.CartItems.set([]);
        localStorage.removeItem("clientCart");
    }

    get total() {
        return this.CartItems().reduce(
            (sum, item) => sum + (item.Equipment?.price || 0) * item.Quantity,
            0
        );
    }

    // Duration calculation (minimum 1 if same day)
    get duration(): number {
        const start = this.datePickerValues().StartDate;
        const end = this.datePickerValues().ExpectedReturnDate;
        if (!start || !end) return 1;

        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include same day borrow
        return diffDays > 0 ? diffDays : 1;
    }

    // Called when user changes start date
    onStartDateChange(selected: Date) {
        if (!selected) return;

        const nextDay = new Date(selected);
        // min return = selected start date (same day allowed)
        this.minReturnDate = nextDay;

        // Adjust return date if before new min
        if (this.datePickerValues().ExpectedReturnDate < nextDay) {
            this.datePickerValues.update((state) => ({
                ...state,
                ExpectedReturnDate: nextDay,
            }));
        }

        // Update payload UTC
        this.requestPayload.update((state) => ({
            ...state,
            StartDate: selected.toISOString(),
        }));
    }

    // Called when user changes return date
    onReturnDateChange(selected: Date) {
        if (!selected) return;
        this.requestPayload.update((state) => ({
            ...state,
            ExpectedReturnDate: selected.toISOString(),
        }));
    }

    handleCheckout() {
        this.Dialog.update(state => ({ ...state, checkOut: true }));
    }

    handleRequestBorrow(){
        const items = this.CartItems().map(item => ({
            EquipmentId: item.Equipment?.id || 0,
            Quantity: item.Quantity
        }));

        this.requestPayload.update(state => ({
            ...state,
            UserId: this.User()?.id || 0,
            StartDate: this.datePickerValues().StartDate.toISOString(),
            ExpectedReturnDate: this.datePickerValues().ExpectedReturnDate.toISOString(),
            Items: items
        }));

        this.borrowService.postRequestBorrow(this.requestPayload()).subscribe({
            next: res=> {
                console.log(res);
                this.Dialog.update(state => ({ ...state, checkOut: true }));
            },
            error: err => console.log(err)
        })
    }
}