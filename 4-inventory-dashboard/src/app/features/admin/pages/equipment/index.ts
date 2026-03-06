import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from "primeng/button";
import { TabsModule } from "primeng/tabs";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { EquipmentCategory, EquipmentCondition, EquipmentStatus } from "../../../../shared/Enums/EquipmentEnums";
import { EquipmentResponseCounts, ICreateEquipmentsRequest, IGetEquipment, IGetEquipmentGroupItem, IGroupEquipmentItems, IUpdateEquipmentRequest } from "../../../../shared/interface/equipments";
import { EquipmentService } from "../../../../core/services/equipment";
import { Colors } from "../../../../shared/colors";
import { CreateEquipmentSchema, UpdateEquipmentSchema } from "../../../../shared/schemas/equipment";
import { AdminStore } from "../../../../shared/interface/cart";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";

@Component({
    selector: "app-admin-equipment",
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        IftaLabelModule,
        InputTextModule,
        ButtonModule,
        TabsModule,
        TableModule,
        TooltipModule,
        DialogModule,
        ChipModule,
        SkeletonModule,
        SelectModule,
        TextareaModule,
    ],
    templateUrl: "./index.html",
})
export class AdminEquipmentComponent implements OnInit {

    Math = Math;
    EquipmentCategory = EquipmentCategory;
    EquipmentCondition = EquipmentCondition;
    EquipmentStatus = EquipmentStatus;
    CategoryList = Object.keys(EquipmentCategory)
        .filter(k => isNaN(Number(k)))
        .map(key => ({
            label: key,
            value: EquipmentCategory[key as keyof typeof EquipmentCategory]
        }));

    private searchSubject = new Subject<string>();
    equipmentService = inject(EquipmentService);
    messageService = inject(MessageService);
    private router = inject(Router);

    public isEquipmentGroupLoad = signal<boolean>(false);
    public isAllEquipmentLoad = signal<boolean>(false);
    public isCreatingEquipment = signal<boolean>(false);
    public isUpdatingEquipment = signal<boolean>(false);

    public equipmentList = signal<IGetEquipment[]>([]);
    public selectedEquipment = signal<IGetEquipmentGroupItem|null>(null);
    public WholeEquipmentItemList = signal<any[]>([]);

    public groupDialog = signal({
        add: false,
        view: false,
        edit: false
    });

    initialCreateEquipmentForm: ICreateEquipmentsRequest = {
        Name: "",
        Description: "",
        Price: 0,
        Category: 1,
        Count: 5
    };
    public createEquipmentForm = signal<ICreateEquipmentsRequest>(this.initialCreateEquipmentForm);

    initialUpdateEquipmentForm: IUpdateEquipmentRequest = {
        Name: "",
        Description: "",
        Price: 0,
        Category: 1,
    };
    public updateEquipmentForm = signal<IUpdateEquipmentRequest>(this.initialUpdateEquipmentForm);



    public initialPaginator = {
        RowCount: 10,
        PageNo: 1,
        SearchString: "",
        IsGroup: true,
        Category: 0,
        Status: 0,
        Condition: 0,
        EquipmentId: 0,
        TotalCount: 0
    };
    public paginatorState = signal(this.initialPaginator);

    public Counts = signal<EquipmentResponseCounts>({
        Category: { Tools: 0, Electronics: 0, Vehicles: 0, Furniture: 0, SafetyGear: 0, Other: 0 },
        Status: { Available: 0, Reserved: 0, InUse: 0, UnderMaintenance: 0 },
        Condition: { New: 0, Good: 0, Damaged: 0, Retired: 0 }
    });

    ngOnInit(): void {

        this.fetchEquipmentGroups();

        this.searchSubject
            .pipe(
                debounceTime(500),
                distinctUntilChanged()
            )
            .subscribe(searchTerm => {

                this.paginatorState.update(state => ({
                    ...state,
                    SearchString: searchTerm,
                    PageNo: 1
                }));

                this.paginatorState().IsGroup
                    ? this.fetchEquipmentGroups()
                    : this.fetchWholeEquipmentsItems(true);
            });
    }

    fetchEquipmentGroups() {
        this.isEquipmentGroupLoad.set(true);
        this.equipmentService.getFilteredEquipment(this.paginatorState())
            .subscribe({
                next: res => {

                    this.equipmentList.set(res.data.items ?? []);

                    this.Counts.update(prev => ({
                        ...prev,
                        Category: res.data.categoryCounts
                    }));

                    this.paginatorState.update(prev => ({
                        ...prev,
                        TotalCount: res.data.totalCount
                    }));

                    this.isEquipmentGroupLoad.set(false);
                },
                error: err => {
                    console.error(err);
                    this.isEquipmentGroupLoad.set(false);
                }
            });
    }

    fetchWholeEquipmentsItems(updateCounts: boolean = false) {

        this.isAllEquipmentLoad.set(true);
        this.equipmentService.getFilteredEquipment({
            ...this.paginatorState(),
            IsGroup: false
        }).subscribe({
            next: res => {

                this.WholeEquipmentItemList.set(res.data.items ?? []);
                console.log("setting data >>>>", this.WholeEquipmentItemList())

                this.paginatorState.update(prev => ({
                    ...prev,
                    TotalCount: res.data.totalCount
                }));

                if (updateCounts) {
                    this.Counts.update(prev => ({
                        ...prev,
                        Status: res.data.statusCounts,
                        Condition: res.data.conditionCounts
                    }));
                }

                this.isAllEquipmentLoad.set(false);
            },
            error: err => {
                console.error(err);
                this.isAllEquipmentLoad.set(false);
            }
        });
    }

    toggleMode() {

        const newIsGroup = !this.paginatorState().IsGroup;

        this.paginatorState.update(state => ({
            ...state,
            IsGroup: newIsGroup,
            PageNo: 1,
            Category: 0,
            Status: 0,
            Condition: 0,
            EquipmentId: 0
        }));

        newIsGroup
            ? this.fetchEquipmentGroups()
            : this.fetchWholeEquipmentsItems(true);
    }

    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.searchSubject.next(value);
    }

    onCategoryTab(i: number) {

        this.paginatorState.update(state => ({
            ...state,
            Category: i,
            Status: 0,
            Condition: 0,
            PageNo: 1
        }));

        this.fetchEquipmentGroups();
    }

    onStatusTab(i: number) {

        this.paginatorState.update(state => ({
            ...state,
            Category: 0,
            Status: i,
            Condition: 0,
            PageNo: 1
        }));

        this.fetchWholeEquipmentsItems(true);
    }

    onConditionTab(i: number) {

        this.paginatorState.update(state => ({
            ...state,
            Category: 0,
            Status: 0,
            Condition: i,
            PageNo: 1
        }));

        this.fetchWholeEquipmentsItems(true);
    }

    onAllTab() {

        this.paginatorState.update(state => ({
            ...state,
            Category: 0,
            Status: 0,
            Condition: 0,
            PageNo: 1
        }));

        this.fetchWholeEquipmentsItems();
    }

    // Pagination
    goToFirstPage() {
        if (this.isFirstPage()) return;

        this.paginatorState.update(state => ({
            ...state,
            PageNo: 1
        }));

        this.paginatorState().IsGroup
            ? this.fetchEquipmentGroups()
            : this.fetchWholeEquipmentsItems();

    }
    goToPreviousPage() {

        if (this.isFirstPage()) return;
        this.paginatorState.update(state => ({
            ...state,
            PageNo: state.PageNo - 1
        }))
        this.paginatorState().IsGroup
            ? this.fetchEquipmentGroups()
            : this.fetchWholeEquipmentsItems();

    }
    goToNextPage() {

        if (this.isLastPage()) return;
        this.paginatorState.update(state => ({
            ...state,
            PageNo: state.PageNo + 1
        }))
        this.paginatorState().IsGroup
            ? this.fetchEquipmentGroups()
            : this.fetchWholeEquipmentsItems();

    }
    goToLastPage() {
        if (this.isLastPage()) return;

        if (this.paginatorState().IsGroup) {
            if (this.paginatorState().Category == 1) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Category.Tools ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Category == 2) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Category.Electronics ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Category == 3) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Category.Vehicles ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Category == 4) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Category.Furniture ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Category == 5) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Category.SafetyGear ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Category == 6) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Category.Other ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            }
            this.fetchEquipmentGroups();
        } else {
            if (this.paginatorState().Status == 1) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Status.Available ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Status == 2) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Status.InUse ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Status == 3) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Status.Reserved ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Status == 4) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Status.UnderMaintenance ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Condition == 1) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Condition.New ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Condition == 2) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Condition.Good ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Condition == 3) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Condition.Damaged ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else if (this.paginatorState().Condition == 4) {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.Counts().Condition.Retired ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            } else {
                this.paginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))
                }))
            }
            this.fetchWholeEquipmentsItems();
        }
    }
    onRowChange(e: any) {
        this.paginatorState.update(state => ({
            ...state,
            RowCount: e,
            PageNo: 1
        }));

        this.paginatorState().IsGroup
            ? this.fetchEquipmentGroups()
            : this.fetchWholeEquipmentsItems();
    }
    isFirstPage() {
        return this.paginatorState().PageNo == 1 ? true : false;
    }
    isLastPage() {
        if (this.paginatorState().IsGroup) {
            if (this.paginatorState().Category == 1) {
                return this.paginatorState().PageNo == Math.ceil((this.Counts().Category.Tools ?? 0) / (this.paginatorState().RowCount ?? 1))
            } else if (this.paginatorState().Category == 2) {
                return this.paginatorState().PageNo == Math.ceil((this.Counts().Category.Electronics ?? 0) / (this.paginatorState().RowCount ?? 1))
            } else if (this.paginatorState().Category == 3) {
                return this.paginatorState().PageNo == Math.ceil((this.Counts().Category.Vehicles ?? 0) / (this.paginatorState().RowCount ?? 1))
            } else if (this.paginatorState().Category == 4) {
                return this.paginatorState().PageNo == Math.ceil((this.Counts().Category.Furniture ?? 0) / (this.paginatorState().RowCount ?? 1))
            } else if (this.paginatorState().Category == 5) {
                return this.paginatorState().PageNo == Math.ceil((this.Counts().Category.SafetyGear ?? 0) / (this.paginatorState().RowCount ?? 1))
            } else if (this.paginatorState().Category == 6) {
                return this.paginatorState().PageNo == Math.ceil((this.Counts().Category.Other ?? 0) / (this.paginatorState().RowCount ?? 1))
            } else {
                return this.paginatorState().PageNo == Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))
            }
        } else {
            if (this.paginatorState().Status == 1) {
                return (this.paginatorState().PageNo == Math.ceil((this.Counts().Status.Available ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.paginatorState().Status == 2) {
                return (this.paginatorState().PageNo == Math.ceil((this.Counts().Status.InUse ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.paginatorState().Status == 3) {
                return (this.paginatorState().PageNo == Math.ceil((this.Counts().Status.Reserved ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.paginatorState().Status == 4) {
                return (this.paginatorState().PageNo == Math.ceil((this.Counts().Status.UnderMaintenance ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.paginatorState().Condition == 1) {
                return (this.paginatorState().PageNo == Math.ceil((this.Counts().Condition.New ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.paginatorState().Condition == 2) {
                return (this.paginatorState().PageNo == Math.ceil((this.Counts().Condition.Good ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.paginatorState().Condition == 3) {
                return (this.paginatorState().PageNo == Math.ceil((this.Counts().Condition.Damaged ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.paginatorState().Condition == 4) {
                return (this.paginatorState().PageNo == Math.ceil((this.Counts().Condition.Retired ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            } else {
                return (this.paginatorState().PageNo == Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
                    true : false;
            }
        }
    }


    // Dialog
    openGroupAddDialog() {
        this.groupDialog.update(state => ({ ...state, add: true }))
    }
    openGroupViewDialog(equipmentId: number) {
        this.router.navigate([`/admin/equipments/view/group/${equipmentId}`])
    }
    openGroupEditDialog(e: IGetEquipmentGroupItem) {
        this.groupDialog.update(state => ({ ...state, edit: true }));
        this.selectedEquipment.set(e);
        this.updateEquipmentForm.set({
            Name: e.name,
            Category: e.category,
            Price: e.price,
            Description: e.description
        });
    }
    getIndex() {
        return (this.paginatorState().PageNo - 1) * this.paginatorState().RowCount;
    }

    getChipColor(color: keyof typeof Colors) {
        return Colors[color] || Colors.neutral;
    }

    //CRUD
    handleAddEquipment() {
        const apiPayload = this.createEquipmentForm();
        const validation = CreateEquipmentSchema.safeParse(apiPayload);
        if (!validation.success) {
            this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: validation.error.issues[0].message || "Validation Error"
            })
            return;
        }

        this.isCreatingEquipment.set(true);
        this.equipmentService.createEquipment(validation.data)
            .subscribe({
                next: res => {
                    this.messageService.add({
                        severity: "success",
                        summary: "Success",
                        detail: res.message || "Equipment created successfully!"
                    });
                    this.fetchEquipmentGroups(),
                        this.groupDialog.update(state => ({ ...state, add: false }));
                    this.isCreatingEquipment.set(false);
                },
                error: err => {
                    this.messageService.add({
                        severity: "error",
                        summary: "Error",
                        detail: err.error?.message || "Failed to create Equipment"
                    });
                    this.isCreatingEquipment.set(false);
                }
            });
    }

    
    handleUpdateEquipment() {
        const id = this.selectedEquipment()?.id||0
        const payload = this.updateEquipmentForm();
        const validation = UpdateEquipmentSchema.safeParse(payload);
        console.log(this.updateEquipmentForm());
        console.log(payload);
        console.log(validation.data)
        if (!validation.success) {
            this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: validation.error.issues[0].message || "Validation Error"
            })
            return;
        }

        this.isUpdatingEquipment.set(true);
        this.equipmentService.updateEquipment(id, payload)
            .subscribe({
                next: res => {
                    this.messageService.add({
                        severity: "success",
                        summary: "Success",
                        detail: res.message || "Equipment updated successfully!"
                    });
                    this.fetchEquipmentGroups(),
                        this.groupDialog.update(state => ({ ...state, edit: false }));
                    this.isUpdatingEquipment.set(false);
                },
                error: err => {
                    this.messageService.add({
                        severity: "error",
                        summary: "Error",
                        detail: err.error?.message || "Failed to update Equipment"
                    });
                    this.isUpdatingEquipment.set(false);
                }
            });
    }

    handleAddToStore(equipment: IGroupEquipmentItems) {
        try {
            if (!equipment) return;

            const adminStore = localStorage.getItem("adminStore");

            if (adminStore !== null) {

                const parsedStore: AdminStore = JSON.parse(adminStore);

                const alreadyExists = parsedStore.Equipments.some(
                    item => item.Equipment?.id === equipment.id
                );

                if (alreadyExists) {
                    this.messageService.add({
                        severity: "error",
                        summary: "Error",
                        detail: `${equipment.name}, Already placed in Store`
                    })
                    return;
                }

                if ((equipment.availableCount || 0) < 1) {
                    alert("Equipment is not available");
                    return;
                }

                parsedStore.Equipments.push({
                    Equipment: equipment,
                    Quantity: 1
                });

                localStorage.setItem("adminStore", JSON.stringify(parsedStore));

            } else {
                const newStore: AdminStore = {
                    User: null,
                    Equipments: [{
                        Equipment: equipment,
                        Quantity: 1
                    }]
                };
                localStorage.setItem("adminStore", JSON.stringify(newStore));
            }
            this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: `${equipment.name}, Added to store successfully!`
            })

        } catch (error) {
            console.error("Error loading cart from localStorage:", error);
            this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Error loading store from localStorage"
            })
        }
    }

}
