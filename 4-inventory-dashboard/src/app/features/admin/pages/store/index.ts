import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { IftaLabelModule } from "primeng/iftalabel";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from "primeng/avatar";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { EquipmentService } from "../../../../core/services/equipment";
import { UserService } from "../../../../core/services/user";
import { IUserResponse } from "../../../../shared/interface/users";
import { IGroupEquipmentItems } from "../../../../shared/interface/equipments";
import { IAssignBorrowRequest } from "../../../../shared/interface/borrows";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { AdminStore, AdminStoreItem } from "../../../../shared/interface/cart";
import { BorrowService } from "../../../../core/services/borrow";




@Component({
    selector: "admin-store-component",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        IftaLabelModule,
        AutoCompleteModule,
        AvatarModule,
        DatePickerModule,
        DialogModule
    ],
    templateUrl: "./index.html"
})
export class AdminStoreComponent implements OnInit {

    private userSubject = new Subject<string>();
    private equipmentSubject = new Subject<string>();
    private equipmentService = inject(EquipmentService);
    private userService = inject(UserService);
    private borrowService = inject(BorrowService);

    public userList = signal<IUserResponse[]>([]);
    public equipmentList = signal<IGroupEquipmentItems[]>([]);

    public selectedUser = signal<IUserResponse | null>(null);
    public selectedEquipment = signal<IGroupEquipmentItems | null>(null);

    public selectedUserModel: IUserResponse | null = null;
    public selectedEquipmentModel: IGroupEquipmentItems | null = null;

    public isUserLoad = signal<boolean>(false);
    public isEquipmentLoad = signal<boolean>(false);

    public assignPayload = signal<IAssignBorrowRequest>({
        UserId: 0,
        StartDate: "",
        ExpectedReturnDate: "",
        Items: [],
    });

    public StoreItems = signal<AdminStore>({
        User: null,
        Equipments: []
    });

    public datePickerValues = signal<{ StartDate: Date; ExpectedReturnDate: Date }>({
        StartDate: new Date(),
        ExpectedReturnDate: new Date(),
    });

    public Dialog = signal<{ checkOut: boolean }>({ checkOut: false });

    public minStartDate: Date = new Date();
    public minReturnDate: Date = new Date();


    public UserPaginatorState = signal({
        Status: 1,
        RowCount: 25,
        PageNo: 1,
        TotalCount: 20,
        BlockedCount: 0,
        ActiveCount: 0,
        SearchString: "",
    });

    public EquipmentPaginatorState = signal({
        RowCount: 25,
        PageNo: 1,
        SearchString: "",
        IsGroup: true,
        Category: 0,
        Status: 0,
        Condition: 0,
        EquipmentId: 0,
        TotalCount: 0
    });

    ngOnInit(): void {

        this.fetchUsers();
        this.fetchEquipmentGroups();

        const today = new Date();
        this.datePickerValues.update((state) => ({
            StartDate: today,
            ExpectedReturnDate: today,
        }));

        this.userSubject
            .pipe(
                debounceTime(500),
                distinctUntilChanged()
            )
            .subscribe(searchTerm => {

                this.UserPaginatorState.update(state => ({
                    ...state,
                    SearchString: searchTerm,
                }));
                this.fetchUsers();
            });

        this.equipmentSubject
            .pipe(
                debounceTime(500),
                distinctUntilChanged()
            )
            .subscribe(searchTerm => {

                this.EquipmentPaginatorState.update(state => ({
                    ...state,
                    SearchString: searchTerm,
                }));
                this.fetchEquipmentGroups();
            });

        this.loadStoreFromStorage();

        window.addEventListener("storage", (event) => {
            if (event.key === "adminStore") {
                this.loadStoreFromStorage();
            }
        });
    }


    loadStoreFromStorage() {
        try {
            const adminStore = localStorage.getItem("adminStore");

            if (adminStore !== null) {
                const parsedStore: AdminStore = JSON.parse(adminStore);

                this.StoreItems.set(parsedStore);
                this.selectedUser.set(parsedStore.User);
                this.selectedUserModel = parsedStore.User;

            } else {
                this.StoreItems.set({
                    User: null,
                    Equipments: []
                });

                this.selectedUser.set(null);
                this.selectedUserModel = null;
            }

        } catch (error) {
            console.error("Error loading cart from localStorage:", error);
        }
    }



    fetchUsers() {
        this.isUserLoad.set(true);
        const state = this.UserPaginatorState();
        this.userService.getFilteredClient(state).subscribe({
            next: (res: any) => {
                this.userList.set(res.data.users);
                this.isUserLoad.set(false);
            },
            error: (err) => console.log("userListError", err),
        });
    }

    fetchEquipmentGroups() {
        this.isEquipmentLoad.set(true);
        this.equipmentService.getFilteredEquipment(this.EquipmentPaginatorState())
            .subscribe({
                next: res => {
                    let equipments: IGroupEquipmentItems[] = res.data.items;
                    let available: IGroupEquipmentItems[] = equipments.filter(e => e.availableCount >= 1);
                    this.equipmentList.set(available ?? []);
                    this.isEquipmentLoad.set(false);
                },
                error: err => {
                    console.error(err);
                    this.isEquipmentLoad.set(false);
                }
            });
    }

    searchUser(event: any) {
        this.userSubject.next(event.query);
    }

    searchEquipment(event: any) {
        this.equipmentSubject.next(event.query);
    }

    onUserSelect(event: any) {
        const user = event.value;
        this.selectedUser.set(user);
        this.selectedUserModel = user;
        this.StoreItems.update(state => ({
            ...state,
            User: user
        }));
        localStorage.setItem("adminStore", JSON.stringify(this.StoreItems()));
    }

    onEquipmentSelect(equipment: any) {
        this.selectedEquipment.set(equipment.value);
        this.addStoreItems();
    }

    addStoreItems() {
        const quantity = 1;
        const equipment = this.selectedEquipment();

        if (!equipment) return;

        if (quantity > (equipment.availableCount || 0)) {
            alert("Equipment is not available");
            return;
        }

        const currentStore = this.StoreItems();

        let updatedEquipments = [...currentStore.Equipments];

        const existingIndex = updatedEquipments.findIndex(
            item => item.Equipment?.id === equipment.id
        );

        if (existingIndex > -1) {
            updatedEquipments[existingIndex].Quantity = quantity;
        } else {
            updatedEquipments.push({
                Equipment: equipment,
                Quantity: quantity
            });
        }

        const updatedStore = {
            ...currentStore,
            Equipments: updatedEquipments
        };
        this.StoreItems.set(updatedStore);
        localStorage.setItem("adminStore", JSON.stringify(updatedStore));
        this.selectedEquipmentModel = null;
        this.selectedEquipment.set(null);
    }

    clearStore() {
        this.StoreItems.update(state => ({
            ...state,
            Equipments: []
        }));
        localStorage.removeItem("adminStore");

        // this.selectedUser.set(null);
        // this.selectedEquipment.set(null);
        // this.selectedUserModel = null;
        // this.selectedEquipmentModel = null;
    }

    updateQuantity(item: AdminStoreItem, change: number) {
        if (!item || !item.Equipment) return;

        const newQty = item.Quantity + change;
        const maxAvailable = item.Equipment.availableCount ?? 1;
        item.Quantity = Math.max(1, Math.min(newQty, maxAvailable));

        this.StoreItems.update(state => ({
            ...state,
            Equipments: [...state.Equipments]
        }));

        localStorage.setItem("adminStore", JSON.stringify(this.StoreItems()));
    }

    removeItem(item: AdminStoreItem) {
        const updatedEquipments = this.StoreItems().Equipments.filter(i => i !== item);

        const updatedStore = {
            ...this.StoreItems(),
            Equipments: updatedEquipments
        };

        this.StoreItems.set(updatedStore);
        localStorage.setItem("adminStore", JSON.stringify(updatedStore));
    }


    get total() {
        return this.StoreItems().Equipments.reduce(
            (sum, item) => sum + (item.Equipment?.price || 0) * item.Quantity,
            0
        );
    }

    // Dialog
    get duration(): number {
        const start = this.datePickerValues().StartDate;
        const end = this.datePickerValues().ExpectedReturnDate;
        if (!start || !end) return 1;
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const diffDays =
            Math.floor(
                (new Date(end).setHours(0, 0, 0, 0) -
                    new Date(start).setHours(0, 0, 0, 0)) / MS_PER_DAY
            ) + 1;
        return diffDays > 0 ? diffDays : 1;
    }

    onStartDateChange(selected: Date) {
        if (!selected) return;

        const nextDay = new Date(selected);
        this.minReturnDate = nextDay;

        if (this.datePickerValues().ExpectedReturnDate < nextDay) {
            this.datePickerValues.update((state) => ({
                ...state,
                ExpectedReturnDate: nextDay,
            }));
        }

        this.assignPayload.update((state) => ({
            ...state,
            StartDate: selected.toISOString(),
        }));
    }

    onReturnDateChange(selected: Date) {
        if (!selected) return;
        this.assignPayload.update((state) => ({
            ...state,
            ExpectedReturnDate: selected.toISOString(),
        }));
    }

    handleCheckout() {
        if (!this.selectedUser()) {
            alert("Please select user")
            return;
        }
        if (this.StoreItems().Equipments.length == 0) {
            alert("Please select Equipment")
            return;
        }
        this.Dialog.update(state => ({ ...state, checkOut: true }));
    }

    handleAssignBorrow() {
        const items = this.StoreItems().Equipments.map(item => ({
            EquipmentId: item.Equipment?.id || 0,
            Quantity: item.Quantity
        }));

        this.assignPayload.update(state => ({
            ...state,
            UserId: this.selectedUser()?.id || 0,
            StartDate: this.datePickerValues().StartDate.toISOString(),
            ExpectedReturnDate: this.datePickerValues().ExpectedReturnDate.toISOString(),
            Items: items
        }));

        this.borrowService.postAssignBorrow(this.assignPayload()).subscribe({
            next: res => {
                console.log(res);
                this.Dialog.update(state => ({ ...state, checkOut: true }));
            },
            error: err => console.log(err)
        });
    }
}