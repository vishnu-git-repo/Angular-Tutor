import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BorrowService } from "../../../../../core/services/borrow";
import { IGetBorrowByIDResponse } from "../../../../../shared/interface/borrows";
import { CommonModule, Location } from "@angular/common";

import { ButtonModule } from "primeng/button";

import { getDateTimeFromUtc } from "../../../../../shared/lib/DateHelper";
import { BorrowStatus } from "../../../../../shared/Enums/BorrowEnum";
import { ChipModule } from "primeng/chip";
import { Colors, getBorrowStatusChip, getChip } from "../../../../../shared/colors";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { PaymentMode, PaymentStatus } from "../../../../../shared/Enums/PaymentEnum";
import { TabsModule } from "primeng/tabs";


@Component({
    selector: "app-client-borrow-view",
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        ChipModule,
        TableModule,
        TooltipModule,
        TabsModule
    ],
    templateUrl: "./index.html"
})

export class ClientBorrowViewComponent implements OnInit {
    id: number;
    PaymentMode = PaymentMode;
    PaymentStatus = PaymentStatus;
    BorrowStatus = BorrowStatus;
    getDateTimeFromUtc = getDateTimeFromUtc;
    getChip = getChip;
    getBorrowStatusChip = getBorrowStatusChip;
    constructor(private route: ActivatedRoute) {
        this.id = this.route.snapshot.params['id'];
    }
    activeTab = signal(1)
    setActiveTab(i: number){
        this.activeTab.set(i);
    }
    private borrowService = inject(BorrowService);
    private location = inject(Location);

    public data = signal<IGetBorrowByIDResponse | null>(null);
    public isDataLoading = signal<boolean>(false);

    ngOnInit(): void {
        this.fetchBorrow();
    }
    fetchBorrow() {
        this.isDataLoading.set(true);
        this.borrowService.getBorrowByID(this.id)
            .subscribe({
                next: res => {
                    this.data.set(res.data);
                },
                error: err => console.log(err)
            });
        this.isDataLoading.set(false);
    }

    handleBackButton() {
        this.location.back();
    }

    handleViewEquipment(id: number){
        
    }

    getChipColor(color: keyof typeof Colors) {
        return Colors[color] || Colors.neutral;
    }
}