import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";

import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from "primeng/table";
import { SkeletonModule } from 'primeng/skeleton';
import { ChipModule } from 'primeng/chip';
import { TabsModule } from "primeng/tabs";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { SelectModule } from 'primeng/select';

import { EquipmentCategoryCounts, IGetEquipment, IReqBorrowRequest } from "../../../../shared/interface/equipments";
import { EquipmentCategory } from "../../../../shared/Enums/EquipmentEnums";
import { Colors } from "../../../../shared/colors";
import { EquipmentService } from "../../../../core/services/equipment";


@Component({
    selector: "app-client-equipment",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IftaLabelModule,
        InputTextModule,
        TableModule,
        SkeletonModule,
        ChipModule,
        TabsModule,
        DialogModule,
        ButtonModule,
        TooltipModule,
        SelectModule
    ],
    templateUrl: "./index.html",
})

export class ClientEquipmentComponent implements OnInit {

    Math = Math;
    EquipmentCategory = EquipmentCategory;
    private equipmentService = inject(EquipmentService);
    private searchSubject = new Subject<string>();

    public equipmentList = signal<IGetEquipment[]>([]);
    public isEquipmentLoad = signal<boolean>(false);
    public selectedEquipment = signal<any>({});
    public Counts = signal<EquipmentCategoryCounts>({
        Tools: 0, Electronics: 0, Vehicles: 0, Furniture: 0, SafetyGear: 0, Other: 0
    })

    // Payload
    public requestPayload = signal<IReqBorrowRequest>({
        UserId: 0,
        EquipmentId: 0,
        EquipmentCount: 1,
        BorrowedDays: 1,
        EquipmentPrice: 0
    })

    public Dialog = signal({
        Request: false
    })

    public initialPaginator = {
        RowCount: 10,
        PageNo: 1,
        SearchString: "",
        IsGroup: true,
        Category: 0,
        Status: 1,
        Condition: 0,
        TotalCount: 0
    };
    public paginatorState = signal(this.initialPaginator);

    ngOnInit(): void {
        this.fetchEquipments();
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
                this.fetchEquipments()
            });
    }
    fetchEquipments() {
        const payload = this.paginatorState();
        this.equipmentService.getFilteredEquipment(payload)
            .subscribe({
                next: res => {
                    console.log(res);
                    this.equipmentList.set(res.data.items);
                    this.Counts.set(res.data.categoryCounts);
                    this.paginatorState.update(state => ({ ...state, TotalCount: res.data.totalCount }))
                },
                error: err => console.log(err)
            })
    }

    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.searchSubject.next(value);
    }
    getIndex() {
        return (this.paginatorState().PageNo - 1) * this.paginatorState().RowCount;
    }
    getChipColor(color: keyof typeof Colors) {
        return Colors[color] || Colors.neutral;
    }

    onCategoryTab(i: number) {
        this.paginatorState.update(state => ({
            ...state,
            PageNo: 1,
            Category: i
        }));
        this.fetchEquipments();
    }


    // Pagination
    goToFirstPage() {
        if (this.isFirstPage()) return;
        this.paginatorState.update(state => ({
            ...state,
            PageNo: 1
        }));
        this.fetchEquipments();
    }
    goToPreviousPage() {
        if (this.isFirstPage()) return;
        this.paginatorState.update(state => ({
            ...state,
            PageNo: state.PageNo - 1
        }));
        this.fetchEquipments();
    }
    goToNextPage() {
        if (this.isLastPage()) return;
        this.paginatorState.update(state => ({
            ...state,
            PageNo: state.PageNo + 1
        }));
        this.fetchEquipments();
    }
    goToLastPage() {
        if (this.isLastPage()) return;
        if (this.paginatorState().Category == 1) {
            this.paginatorState.update(state => ({
                ...state,
                PageNo: Math.ceil((this.Counts().Tools ?? 0) / (this.paginatorState().RowCount ?? 1))
            }));
        } else if (this.paginatorState().Category == 2) {
            this.paginatorState.update(state => ({
                ...state,
                PageNo: Math.ceil((this.Counts().Electronics ?? 0) / (this.paginatorState().RowCount ?? 1))
            }));
        } else if (this.paginatorState().Category == 3) {
            this.paginatorState.update(state => ({
                ...state,
                PageNo: Math.ceil((this.Counts().Vehicles ?? 0) / (this.paginatorState().RowCount ?? 1))
            }));
        } else if (this.paginatorState().Category == 4) {
            this.paginatorState.update(state => ({
                ...state,
                PageNo: Math.ceil((this.Counts().Furniture ?? 0) / (this.paginatorState().RowCount ?? 1))
            }));
        } else if (this.paginatorState().Category == 5) {
            this.paginatorState.update(state => ({
                ...state,
                PageNo: Math.ceil((this.Counts().SafetyGear ?? 0) / (this.paginatorState().RowCount ?? 1))
            }));
        } else if (this.paginatorState().Category == 6) {
            this.paginatorState.update(state => ({
                ...state,
                PageNo: Math.ceil((this.Counts().Other ?? 0) / (this.paginatorState().RowCount ?? 1))
            }));
        } else {
            this.paginatorState.update(state => ({
                ...state,
                PageNo: Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))
            }));
        }
        this.fetchEquipments();
    }
    onRowChange(num: number) {
        this.paginatorState.update(state => ({
            ...state,
            RowCount: num
        }))
        this.fetchEquipments();
    }
    isFirstPage() {
        return this.paginatorState().PageNo == 1 ?
            true : false;
    }
    isLastPage() {
        if (this.paginatorState().Category == 1) {
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Tools ?? 0) / (this.paginatorState().RowCount ?? 1));
        } else if (this.paginatorState().Category == 2) {
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Electronics ?? 0) / (this.paginatorState().RowCount ?? 1))
        } else if (this.paginatorState().Category == 3) {
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Vehicles ?? 0) / (this.paginatorState().RowCount ?? 1))
        } else if (this.paginatorState().Category == 4) {
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Furniture ?? 0) / (this.paginatorState().RowCount ?? 1))
        } else if (this.paginatorState().Category == 5) {
            return this.paginatorState().PageNo == Math.ceil((this.Counts().SafetyGear ?? 0) / (this.paginatorState().RowCount ?? 1))
        } else if (this.paginatorState().Category == 6) {
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Other ?? 0) / (this.paginatorState().RowCount ?? 1))
        } else {
            return this.paginatorState().PageNo == Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))
        }
    }


    // Dialogs
    openRequestBorrowDialog(e: any) {
        this.Dialog.update( state => ({
            ...state,
            Request: true
        }))
        this.selectedEquipment.set(e)
        console.log("Selected Equipment>>>>",this.selectedEquipment())
    }


    // CRUD
    handleRequestBorrow () {

    }
} 