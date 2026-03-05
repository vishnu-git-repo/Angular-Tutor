import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule, Location } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { getDateTimeFromUtc } from "../../../../shared/lib/DateHelper";
import { EquipmentService } from "../../../../core/services/equipment";
import { Colors, EquipmentColors } from "../../../../shared/colors";
import { FormsModule } from "@angular/forms";


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

interface IBorrowCountsRequest {
    Requested: number;
    Accepted: number;
    Assigned: number;
    Pending: number;
    Paid: number;
    Approved: number;
    Waitlisted: number;
    Ack: number;
    Closed: number;
}

@Component({
    selector: "app-admin-insight",
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FormsModule
    ],
    templateUrl: "./index.html"
})
export class AdminInsightComponent implements OnInit {
    id: number;
    getDateTimeFromUtc = getDateTimeFromUtc;
    constructor(private route: ActivatedRoute) {
        this.id = this.route.snapshot.params['id'];
    }
    private equipmentService = inject(EquipmentService);
    private location = inject(Location);

    // Loading State
    public isDataLoading = signal<boolean>(false);
    public equipmentCounts = signal<IEquipmentCountsRequest>({
        totalCounts: 10,
        statusCounts: {
            Available: 3,
            InUse: 5,
            Reserved: 0,
            Maintenance: 0,
        },
        conditionCounts: {
            New: 2,
            Good: 8,
            Damaged: 0,
            Retired: 0
        }
    })
    
    public animateBars = signal(false);
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

    handleBackButton() {
        this.location.back();
    }

    handleViewEquipment(id: number) {

    }


    getChipColor(color: keyof typeof EquipmentColors) {
        return EquipmentColors[color] || EquipmentColors.neutral;
    }

    getPercentage(value: number): number {
        const total = this.equipmentCounts()?.totalCounts || 1;
        return Math.round((value / total) * 100);
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
}