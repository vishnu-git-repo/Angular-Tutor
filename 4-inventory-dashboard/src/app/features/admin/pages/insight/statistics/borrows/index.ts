import { Component, inject, Input, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule, Location } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { getDateTimeFromUtc } from "../../../../../../shared/lib/DateHelper";
import { EquipmentService } from "../../../../../../core/services/equipment";
import { Colors, EquipmentColors } from "../../../../../../shared/colors";
import { IBorrowCounts, IUserCounts } from "../../../../../../shared/interface/insight/admin";



@Component({
    selector: "app-admin-insight-borrow-statistics",
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FormsModule
    ],
    templateUrl: "./index.html"
})
export class AdminInsightBorrowStatisticsComponent {

    @Input() data!: IBorrowCounts;

    // isDataLoading = signal(false);
    animateBars = signal(false);

    ngAfterViewInit() {
        setTimeout(() => {
            this.animateBars.set(true);
        }, 100);
    }


    getPercentage(value: number): number {
        const total = this.data.total || 1;
        const percentage = (value / total) * 100;
        return Number(percentage.toFixed(2));
    }

    getStatusStyle(status: string) {

        const map: Record<string, keyof typeof Colors> = {
            Requested: "blue",
            Accepted: "indigo",
            Assigned: "purple",
            Pending: "yellow",
            Paid: "success",
            Approved: "green",
            Waitlisted: "orange",
            Ack: "purple",
            Closed: "red"
        }

        return Colors[map[status] || "neutral"];

    }
    get statusList() {

        return [
            { key: "Requested", value: this.data.status.Requested || 0 },
            { key: "Accepted", value: this.data.status.Accepted || 0 },
            { key: "Assigned", value: this.data.status.Assigned || 0 },
            { key: "Pending", value: this.data.status.Pending || 0 },
            { key: "Paid", value: this.data.status.Paid || 0 },
            { key: "Approved", value: this.data.status.Approved || 0 },
            { key: "Waitlisted", value: this.data.status.Waitlisted || 0 },
            { key: "Closed", value: this.data.status.Closed || 0 }
        ];

    }
}