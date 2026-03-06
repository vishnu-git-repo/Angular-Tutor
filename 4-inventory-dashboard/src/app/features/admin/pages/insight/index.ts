import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule, Location } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { getDateTimeFromUtc } from "../../../../shared/lib/DateHelper";
import { EquipmentService } from "../../../../core/services/equipment";
import { Colors, EquipmentColors } from "../../../../shared/colors";
import { FormsModule } from "@angular/forms";
import { AdminInsightEquipmentStatisticsComponent } from "./statistics/equipment";
import { TabsModule } from "primeng/tabs";
import { AdminInsightBorrowStatisticsComponent } from "./statistics/borrows";
import { AdminInsightUserStatisticsComponent } from "./statistics/user";
import { IAdminInsightCounts } from "../../../../shared/interface/insight/admin";
import { InsightService } from "../../../../core/services/insight";
import { MessageService } from "primeng/api";

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
        FormsModule,
        TabsModule,
        AdminInsightEquipmentStatisticsComponent,
        AdminInsightBorrowStatisticsComponent,
        AdminInsightUserStatisticsComponent,
    ],
    templateUrl: "./index.html"
})
export class AdminInsightComponent implements OnInit {

    private insightService = inject(InsightService);
    private messageService = inject(MessageService);
    public isDataLoading = signal(false);
    public InsightCounts = signal<IAdminInsightCounts>({
        user: {
            total: 0,
            status: {
                Active: 0,
                Inactive: 0
            }
        },
        equipment: {
            total: 0,
            status: {
                Available: 0,
                Reserved: 0,
                UnderMaintenance: 0,
                InUse: 0
            },
            condition: {
                New: 0,
                Damaged: 0,
                Retired: 0,
                Good: 0
            }
        },
        borrow: {
            total: 0,
            status: {
                Accepted: 0,
                Assigned: 0,
                Requested: 0,
                Pending: 0,
                Paid: 0,
                Approved: 0,
                Waitlisted: 0,
                Ack: 0,
                Closed: 0
            }
        }
    })

    ngOnInit(): void {
        this.fetchAdminInsightCounts()
    }

    fetchAdminInsightCounts() {
        this.isDataLoading.set(true);
        this.insightService.getAdminInsightCounts()
            .subscribe({
                next: res => {
                    this.InsightCounts.set(res.data);
                },
                error: err => {
                    this.messageService.add({
                        severity: "error",
                        summary: "Error",
                        detail: err.error?.message
                    })
                }
            })
        this.isDataLoading.set(false);
    }

    activeTab = signal<number>(1);

    setActiveTab(n: number) {
        this.activeTab.set(n);
    }
}