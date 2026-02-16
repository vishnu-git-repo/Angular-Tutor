import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
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
import { EquipmentResponseCounts, IGetEquipment } from "../../../../shared/interface/equipments";
import { EquipmentService } from "../../../../core/services/equipment";

@Component({
    selector: "app-admin-equipment",
    standalone: true,
    imports: [
        RouterLink,
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

    private searchSubject = new Subject<string>();
    equipmentService = inject(EquipmentService);

    public isEquipmentGroupLoad = signal<boolean>(false);
    public isEquipmentGroupItemsLoad = signal<boolean>(false);
    public isAllEquipmentLoad = signal<boolean>(false);

    public equipmentList = signal<IGetEquipment[]>([]);
    public equipmentItemsList = signal<any[]>([]);
    public WholeEquipmentItemList = signal<any[]>([]);

    public Counts = signal<EquipmentResponseCounts>({
        Category: { Tools: 0, Electronics: 0, Vehicles: 0, Furniture: 0, SafetyGear: 0, Other: 0 },
        Status: { Available: 0, Reserved: 0, InUse: 0, UnderMaintenance: 0 },
        Condition: { New: 0, Good: 0, Damaged: 0, Retired: 0 }
    });

    public isGroupViewDialogOpen = false;

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

        this.equipmentService.getFilteredEquipment(this.paginatorState())
            .subscribe({
                next: res => {

                    this.equipmentItemsList.set(res.data.items ?? []);

                    this.Counts.update(prev => ({
                        ...prev,
                        Status: res.data.statusCounts,
                        Condition: res.data.conditionCounts
                    }));

                    this.paginatorState.update(prev => ({
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

    openGroupViewDialog(equipmentId: number) {

        this.isGroupViewDialogOpen = true;

        this.paginatorState.update(s => ({
            ...s,
            EquipmentId: equipmentId,
            Status: 0,
            Condition: 0
        }));

        this.fetchEquipmentsGroupItems();
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

    OnEquipmentRowChange(e: any) {

        this.paginatorState.update(state => ({
            ...state,
            RowCount: e,
            PageNo: 1
        }));

        this.paginatorState().IsGroup
            ? this.fetchEquipmentGroups()
            : this.fetchWholeEquipmentsItems();
    }

    EquipmentCategoryMapper(v: number) {
        return v == 1 ? EquipmentCategory.Tools :
               v == 2 ? EquipmentCategory.Electronics :
               v == 3 ? EquipmentCategory.Vehicles :
               v == 4 ? EquipmentCategory.Furniture :
               v == 5 ? EquipmentCategory.SafetyGear :
               EquipmentCategory.Other;
    }

    EquipmentStatusMapper(s: number) {
        return s == 1 ? EquipmentStatus.Available :
               s == 2 ? EquipmentStatus.InUse :
               s == 3 ? EquipmentStatus.Reserved :
               EquipmentStatus.UnderMaintenance;
    }

    EquipmentConditionMapper(c: number) {
        return c == 1 ? EquipmentCondition.New :
               c == 2 ? EquipmentCondition.Good :
               c == 3 ? EquipmentCondition.Damaged :
               EquipmentCondition.Retired;
    }

    // Pagination
    goToFirstPage() {

    }
    goToPreviousPage() {

    }
    goToNextPage() {

    }
    goToLastPage() {

    }
    onRowChange() {

    }

    //CRUD
    handleAddEquipment() {}
}
