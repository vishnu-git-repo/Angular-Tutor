import { Component, inject, Input, OnInit, signal } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { EquipmentService } from "../../../../../../core/services/equipment";
import { Colors, EquipmentColors } from "../../../../../../shared/colors";
import { IEquipmentCounts } from "../../../../../../shared/interface/insight/admin";

interface IEquipmentCountsRequest {
    totalCounts: number
    statusCounts: {
        Available: number,
        InUse: number,
        Reserved: number,
        Maintenance: number,
    },
    conditionCounts: {
        New: number,
        Good: number,
        Damaged: number,
        Retired: number
    }
}

@Component({
    selector: "app-admin-insight-equipment-statistics",
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FormsModule
    ],
    templateUrl: "./index.html"
})
export class AdminInsightEquipmentStatisticsComponent implements OnInit {

    @Input() data!: IEquipmentCounts;

    isDataLoading = signal(false);

    animateBars = signal(false);

    ngAfterViewInit() {
        setTimeout(() => {
            this.animateBars.set(true);
        }, 100);
    }

    ngOnInit(): void {
        this.fetchEquipments();
    }
    fetchEquipments() {

    }

    getPercentage(value: number): number {
        const total = this.data.total || 1;
        const percentage = (value / total) * 100;
        return Number(percentage.toFixed(2));
    }

    getStatusStyle(status: string) {

        const map: Record<string, keyof typeof Colors> = {
            Available: "green",
            InUse: "blue",
            Reserved: "yellow",
            Maintenance: "red"
        };

        return Colors[map[status] || "neutral"];

    }

    getConditionStyle(condition: string) {

        const map: Record<string, keyof typeof Colors> = {
            New: "green",
            Good: "teal",
            Damaged: "orange",
            Retired: "slate"
        };

        return Colors[map[condition] || "neutral"];

    }

    get statusList() {

        const counts = this.data.status;

        return [
            { key: "Available", value: counts.Available },
            { key: "InUse", value: counts.InUse },
            { key: "Reserved", value: counts.Reserved },
            { key: "Maintenance", value: counts.UnderMaintenance }
        ];

    }

    get conditionList() {

        const counts = this.data.condition;

        return [
            { key: "New", value: counts.New },
            { key: "Good", value: counts.Good },
            { key: "Damaged", value: counts.Damaged },
            { key: "Retired", value: counts.Retired }
        ];

    }

}