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
import { dEquipmentResponseCounts, EquipmentResponseCounts, ICreateEquipmentsRequest, IGetEquipment } from "../../../../shared/interface/equipments";
import { EquipmentService } from "../../../../core/services/equipment";
import { Colors } from "../../../../shared/colors";
import { CategoryConstant } from "../../../../shared/constants";
import { CreateEquipmentSchema } from "../../../../shared/schemas/equipment";

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
        TextareaModule
    ],
    templateUrl: "./index.html",
})
export class AdminEquipmentComponent implements OnInit {

    Math = Math;
    EquipmentCategory = EquipmentCategory;
    EquipmentCondition = EquipmentCondition;
    EquipmentStatus = EquipmentStatus;
    CategoryList = CategoryConstant;
    
    private searchSubject = new Subject<string>();
    equipmentService = inject(EquipmentService);

    public isEquipmentGroupLoad = signal<boolean>(false);
    public isEquipmentGroupItemsLoad = signal<boolean>(false);
    public isAllEquipmentLoad = signal<boolean>(false);

    public equipmentList = signal<IGetEquipment[]>([]);
    public equipmentItemsList = signal<any[]>([]);
    public WholeEquipmentItemList = signal<any[]>([]);

    public groupDialog = signal({
        add: false,
        view: false,
        edit: false
    });

    initialCreateEquipmentForm: {
        Name: string;
        Description: string;
        Price: number;
        Category: keyof typeof EquipmentCategory;
        Count: number;
    } = {
            Name: "",
            Description: "",
            Price: 0,
            Category: "Other",
            Count: 5
        };
    public createEquipmentForm = signal(this.initialCreateEquipmentForm);


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


    public dPaginatorState = signal({
        RowCount: 10,
        PageNo: 1,
        SearchString: "",
        IsGroup: false,
        Category: 0,
        Status: 0,
        Condition: 0,
        EquipmentId: 0,
        TotalCount: 0
    })
    public dCounts = signal<dEquipmentResponseCounts>({
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
                    : this.fetchWholeEquipmentsItems();
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

    fetchEquipmentsGroupItems() {

        this.isEquipmentGroupItemsLoad.set(true);

        this.equipmentService.getFilteredEquipment(this.dPaginatorState())
            .subscribe({
                next: res => {

                    this.equipmentItemsList.set(res.data.items ?? []);

                    this.dCounts.update(prev => ({
                        ...prev,
                        Status: res.data.statusCounts,
                        Condition: res.data.conditionCounts
                    }));

                    this.dPaginatorState.update(prev => ({
                        ...prev,
                        TotalCount: res.data.totalCount
                    }));

                    this.isEquipmentGroupItemsLoad.set(false);
                },
                error: err => {
                    console.error(err);
                    this.isEquipmentGroupItemsLoad.set(false);
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

        this.fetchWholeEquipmentsItems();
    }

    onConditionTab(i: number) {

        this.paginatorState.update(state => ({
            ...state,
            Category: 0,
            Status: 0,
            Condition: i,
            PageNo: 1
        }));

        this.fetchWholeEquipmentsItems();
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
    goToFirstPage(i: number) {
        if (this.isFirstPage(i)) return;
        if (i == 1) {
            this.paginatorState.update(state => ({
                ...state,
                PageNo: 1
            }));

            this.paginatorState().IsGroup
                ? this.fetchEquipmentGroups()
                : this.fetchWholeEquipmentsItems();
        } else {
            this.dPaginatorState.update(state => ({
                ...state,
                PageNo: 1
            }))
            this.fetchEquipmentsGroupItems();
        }
    }
    goToPreviousPage(i: number) {
        if (i == 1) {
            if (this.isFirstPage(i)) return;
            this.paginatorState.update(state => ({
                ...state,
                PageNo: state.PageNo - 1
            }))
            this.paginatorState().IsGroup
                ? this.fetchEquipmentGroups()
                : this.fetchWholeEquipmentsItems();
        } else {
            if (this.isFirstPage(i)) return;
            this.dPaginatorState.update(state => ({
                ...state,
                PageNo: state.PageNo - 1
            }))
            this.fetchEquipmentsGroupItems();
        }
    }
    goToNextPage(i: number) {
        if (i == 1) {
            if (this.isLastPage(i)) return;
            this.paginatorState.update(state => ({
                ...state,
                PageNo: state.PageNo + 1
            }))
            this.paginatorState().IsGroup
                ? this.fetchEquipmentGroups()
                : this.fetchWholeEquipmentsItems();
        } else {
            if (this.isLastPage(i)) return;
            this.dPaginatorState.update(state => ({
                ...state,
                PageNo: state.PageNo + 1
            }))
            this.fetchEquipmentsGroupItems();
        }
    }
    goToLastPage(i: number) {
        if (this.isLastPage(i)) {
            console.log("Iam already in last page!")
            return;
        };
        console.log("I value ===>", i)
        if (i == 1) {
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
        } else if (i == 2) {
            if (this.dPaginatorState().Status == 1) {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dCounts().Status.Available ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            } else if (this.dPaginatorState().Status == 2) {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dCounts().Status.InUse ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            } else if (this.dPaginatorState().Status == 3) {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dCounts().Status.Reserved ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            } else if (this.dPaginatorState().Status == 4) {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dCounts().Status.UnderMaintenance ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            } else if (this.dPaginatorState().Condition == 1) {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dCounts().Condition.New ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            } else if (this.dPaginatorState().Condition == 2) {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dCounts().Condition.Good ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            } else if (this.dPaginatorState().Condition == 3) {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dCounts().Condition.Damaged ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            } else if (this.dPaginatorState().Condition == 4) {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dCounts().Condition.Retired ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            } else {
                this.dPaginatorState.update(state => ({
                    ...state,
                    PageNo: Math.ceil((this.dPaginatorState().TotalCount ?? 0) / (this.dPaginatorState().RowCount ?? 1))
                }))
            }
            this.fetchEquipmentsGroupItems();
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
            console.log("Go to last api calling")
            this.fetchWholeEquipmentsItems();
        }
    }
    onRowChange(i: number, e: any) {
        if (i == 1) {
            this.paginatorState.update(state => ({
                ...state,
                RowCount: e,
                PageNo: 1
            }));

            this.paginatorState().IsGroup
                ? this.fetchEquipmentGroups()
                : this.fetchWholeEquipmentsItems();
        } else {
            this.dPaginatorState.update(state => ({
                ...state,
                RowCount: e,
                PageNo: 1
            }))
            this.fetchEquipmentsGroupItems();
        }
    }
    isFirstPage(i: number) {
        if (i == 1) {
            return this.paginatorState().PageNo == 1 ?
                true : false;
        } else {
            return this.dPaginatorState().PageNo == 1 ?
                true : false;
        }
    }
    isLastPage(i: number) {
        if (i == 1) {
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
        } if (i == 2) {
            if (this.dPaginatorState().Status == 1) {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dCounts().Status.Available ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.dPaginatorState().Status == 2) {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dCounts().Status.InUse ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.dPaginatorState().Status == 3) {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dCounts().Status.Reserved ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.dPaginatorState().Status == 4) {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dCounts().Status.UnderMaintenance ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.dPaginatorState().Condition == 1) {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dCounts().Condition.New ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.dPaginatorState().Condition == 2) {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dCounts().Condition.Good ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.dPaginatorState().Condition == 3) {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dCounts().Condition.Damaged ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
            } else if (this.dPaginatorState().Condition == 4) {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dCounts().Condition.Retired ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
            } else {
                return (this.dPaginatorState().PageNo == Math.ceil((this.dPaginatorState().TotalCount ?? 0) / (this.dPaginatorState().RowCount ?? 1))) ?
                    true : false;
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

        this.groupDialog.update(state => ({ ...state, view: true }))

        this.dPaginatorState.update(s => ({
            ...s,
            EquipmentId: equipmentId,
            Status: 0,
            Condition: 0
        }));
        this.fetchEquipmentsGroupItems();
    }
    openGroupEditDialog(equipmentId: number) {

        this.groupDialog.update(state => ({ ...state, edit: true }))

        this.paginatorState.update(s => ({
            ...s,
            EquipmentId: equipmentId,
            Status: 0,
            Condition: 0
        }));

        this.fetchEquipmentsGroupItems();
    }

    getIndex(i: number) {
        if (i == 1)
            return (this.paginatorState().PageNo - 1) * this.paginatorState().RowCount;
        return (this.dPaginatorState().PageNo - 1) * this.dPaginatorState().RowCount;
    }

    getChipColor(color: keyof typeof Colors) {
        return Colors[color] || Colors.neutral;
    }

    //CRUD
    handleAddEquipment() {
        const formValue = this.createEquipmentForm();

        const apiPayload = {
            ...formValue,
            Category: EquipmentCategory[formValue.Category]
        };

        const result = CreateEquipmentSchema.safeParse(apiPayload);

        if (!result.success) {
            console.log(result.error);
            return;
        }

        this.equipmentService.createEquipment(result.data)
            .subscribe({
                next: res => {
                    console.log(res),
                    this.fetchEquipmentGroups(),
                    this.groupDialog.update( state => ({...state, add: false}))
                },
                error: err => console.log(err)
            });
    }
}
