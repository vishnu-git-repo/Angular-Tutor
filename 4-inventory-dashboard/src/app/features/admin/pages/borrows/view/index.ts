import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BorrowService } from "../../../../../core/services/borrow";
import { IGetBorrowByIDResponse } from "../../../../../shared/interface/borrows";
import { CommonModule, Location } from "@angular/common";

import { ButtonModule } from "primeng/button";

import { getDateTimeFromUtc } from "../../../../../shared/lib/DateHelper";
import { BorrowStatus, PaymentMode } from "../../../../../shared/Enums/BorrowEnum";
import { ChipModule } from "primeng/chip";
import { Colors } from "../../../../../shared/colors";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";


@Component({
    selector: "app-admin-borrow-view",
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        ChipModule,
        TableModule,
        TooltipModule
    ],
    templateUrl: "./index.html"
})

export class AdminBorrowViewComponent implements OnInit {
    id: number;
    PaymentMode = PaymentMode;
    BorrowStatus = BorrowStatus;
    getDateTimeFromUtc = getDateTimeFromUtc;
    constructor(private route: ActivatedRoute) {
        this.id = this.route.snapshot.params['id'];
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