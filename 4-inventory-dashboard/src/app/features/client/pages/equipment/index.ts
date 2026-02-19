import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from "primeng/table";
import { SkeletonModule } from 'primeng/skeleton';
import { ChipModule } from 'primeng/chip';
import { TabsModule } from "primeng/tabs";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { EquipmentCategoryCounts, IGetEquipment } from "../../../../shared/interface/equipments";
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
        TooltipModule
    ],
    templateUrl: "./index.html",
})

export class ClientEquipmentComponent implements OnInit {

    EquipmentCategory = EquipmentCategory;
    private equipmentService = inject(EquipmentService);
    private searchSubject = new Subject<string>();

    public equipmentList = signal<IGetEquipment[]>([]);
    public isEquipmentLoad = signal<boolean>(false);
    public selectedEquipment = signal({});
    public Counts = signal<EquipmentCategoryCounts>({ 
        Tools: 0, Electronics: 0, Vehicles: 0, Furniture: 0, SafetyGear: 0, Other: 0
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
                this.paginatorState.update( state => ({...state, TotalCount: res.data.totalCount}))
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

    openRequestBorrow(e: any) {

    }

    onCategoryTab(i: number){

    }

} 