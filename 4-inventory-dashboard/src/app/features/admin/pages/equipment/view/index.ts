import { Component, inject, OnInit, signal } from "@angular/core";
import { getDateTimeFromUtc } from "../../../../../shared/lib/DateHelper";
import { EquipmentService } from "../../../../../core/services/equipment";
import { ActivatedRoute } from "@angular/router";
import { Colors, EquipmentColors } from "../../../../../shared/colors";
import { CommonModule, Location } from "@angular/common";
import { ButtonModule } from "primeng/button";
import {
    dEquipmentResponseCounts,
    IGetEquipmentGroupItems
} from "../../../../../shared/interface/equipments";
import { number } from "zod";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { IftaLabelModule } from "primeng/iftalabel";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { TableModule } from "primeng/table";
import { TabsModule } from "primeng/tabs";
import { ChipModule } from "primeng/chip";
import { SkeletonModule } from "primeng/skeleton";
import { SelectModule } from "primeng/select";
import { TextareaModule } from "primeng/textarea";
import { EquipmentCategory, EquipmentCondition, EquipmentStatus } from "../../../../../shared/Enums/EquipmentEnums";

@Component({
    selector: "app-admin-equipment-group-view",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TooltipModule,
        DialogModule,
        InputTextModule,
        IftaLabelModule,
        TableModule,
        TabsModule,
        ChipModule,
        SkeletonModule,
        SelectModule,
        TextareaModule,
    ],
    templateUrl: "./index.html"
})
export class AdminEquipmentGroupViewComponent implements OnInit {

    Math = Math;
    EquipmentStatus = EquipmentStatus;
    EquipmentCondition = EquipmentCondition;
    EquipmentCategory = EquipmentCategory;

    private route = inject(ActivatedRoute);
    private equipmentService = inject(EquipmentService);
    private location = inject(Location);
    private messageService = inject(MessageService);

    getDateTimeFromUtc = getDateTimeFromUtc;

    // Equipment Id
    id: number = 0;

    // Loading State
    public isDataLoading = signal<boolean>(false);

    // Buttons
    public Buttons = signal<{
        add: boolean
    }>({
        add: true
    })

    // Dialogs
    public Dialog = signal<{
        add: boolean
    }>({
        add: false
    })

    AddPayload = signal<{
        Count: number,
        EquipmentId: number
    }>({
        Count: 1,
        EquipmentId: 0
    });

    // Equipment Items
    public equipment = signal<{
        name: string,
        price: number,
        category: number,
        count: number,
        description: string,
        createdAt: string,
        updatedAt: string
    }
    >({
        name: "",
        price: 0.00,
        category: 0,
        count: 0,
        description: "",
        createdAt: "",
        updatedAt: ""
    })
    public equipmentList = signal<{
        id: number,
        status: number,
        condition: number,
        createdAt: string,
        updatedAt: string
    }[]>([]);

    // Counts
    public Counts = signal<dEquipmentResponseCounts>({
        Status: {
            Available: 0,
            Reserved: 0,
            InUse: 0,
            UnderMaintenance: 0
        },
        Condition: {
            New: 0,
            Good: 0,
            Damaged: 0,
            Retired: 0
        }
    });

    public paginatorState = signal<IGetEquipmentGroupItems>({
        RowCount: 10,
        PageNo: 1,
        Status: 0,
        Condition: 0,
        TotalCount: 0,
        EquipmentId: 0
    });

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            this.id = Number(params["id"]);
            this.AddPayload.update(state => ({ ...state, EquipmentId: this.id }))

            this.paginatorState.update(prev => ({
                ...prev,
                EquipmentId: this.id
            }));

            this.fetchEquipments();

        });

    }

    fetchEquipments() {

        this.isDataLoading.set(true);

        this.equipmentService
            .getEquipmentGroupItems(this.paginatorState())
            .subscribe({
                next: (res) => {
                    const data = res?.data;
                    this.equipment.set(data.equipment)
                    this.equipmentList.set(data?.items ?? []);
                    this.Counts.update(prev => ({
                        ...prev,
                        Status: data?.statusCounts ?? prev.Status,
                        Condition: data?.conditionCounts ?? prev.Condition
                    }));
                    this.paginatorState.update(prev => ({
                        ...prev,
                        TotalCount: data?.totalCount ?? 0
                    }));
                    this.isDataLoading.set(false);
                },
                error: (err) => {
                    console.error("Equipment Fetch Error:", err);
                    this.isDataLoading.set(false);
                }
            });
    }

    handleBackButton() {
        this.location.back();
    }

    openAddEquipmentDialog() {
        this.Dialog.update(state => ({ ...state, add: true }))
        this.Buttons.update(state => ({ ...state, add: false }))
    }

    addItems() {
        if (this.AddPayload().Count <= 0) {
            this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Please, Enter valid Count"
            });
            return;
        }
        this.Buttons.update(state => ({ ...state, add: true }))
        this.equipmentService.createEquipmentItems(this.AddPayload())
            .subscribe({
                next: res => {
                    this.messageService.add({
                        severity: "success",
                        summary: "Success",
                        detail: res?.message || "Items Added successfully"
                    })
                    this.fetchEquipments();
                    this.Dialog.update(state => ({ ...state, add: false }));
                },
                error: err => {
                    this.messageService.add({
                        severity: "error",
                        summary: "Error",
                        detail: err.error?.message
                    })
                    this.Buttons.update(state => ({ ...state, add: false }))
                }
            })
    }

    onAllTab() {
        this.paginatorState.update(state => ({
            ...state,
            Category: 0,
            Status: 0,
            Condition: 0,
            PageNo: 1
        }));
        this.fetchEquipments();
    }

    onStatusTab(i: number) {
        this.paginatorState.update(state => ({
            ...state,
            Category: 0,
            Status: i,
            Condition: 0,
            PageNo: 1
        }));
        this.fetchEquipments();
    }

    onConditionTab(i: number) {
        this.paginatorState.update(state => ({
            ...state,
            Category: 0,
            Status: 0,
            Condition: i,
            PageNo: 1
        }));
        this.fetchEquipments();
    }

    getChipColor(color: keyof typeof Colors) {
        return Colors[color] || Colors.neutral;
    }
    getIndex() {
        return (this.paginatorState().PageNo - 1) * this.paginatorState().RowCount;
    }

    // Pagination
    goToFirstPage() {
        if (this.isFirstPage()) return;
        this.paginatorState.update(state => ({
            ...state,
            PageNo: 1
        }));
        this.fetchEquipments()
    }
    goToPreviousPage(){
        if (this.isFirstPage()) return;
        this.paginatorState.update(state => ({
            ...state,
            PageNo: state.PageNo - 1
        }))
        this.fetchEquipments()
    }
    goToNextPage() {
        if (this.isLastPage()) return;
        this.paginatorState.update(state => ({
            ...state,
            PageNo: state.PageNo + 1
        }))
        this.fetchEquipments()
    }
    goToLastPage(){
        if (this.isLastPage()) return;
        if (this.paginatorState().Status == 1) {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Status.Available ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        } else if (this.paginatorState().Status == 2) {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Status.InUse ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        } else if (this.paginatorState().Status == 3) {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Status.Reserved ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        } else if (this.paginatorState().Status == 4) {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Status.UnderMaintenance ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        } else if (this.paginatorState().Condition == 1) {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Condition.New ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        } else if (this.paginatorState().Condition == 2) {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Condition.Good ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        } else if (this.paginatorState().Condition == 3) {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Condition.Damaged ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        } else if (this.paginatorState().Condition == 4) {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Condition.Retired ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        } else {
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))}))
        }
        this.fetchEquipments();
    }

    isFirstPage() {
        return this.paginatorState().PageNo == 1 ?
            true : false;
    }
    isLastPage() {
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

    onRowChange(n: number){
        this.paginatorState.update( state => ({ ...state, RowCount: n, PageNo: 1 }));
        this.fetchEquipments();
    }
}