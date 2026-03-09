import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { IClientInsightCounts } from "../../../../shared/interface/insight";
import { InsightService } from "../../../../core/services/insight";
import { MessageService } from "primeng/api";
import { AuthService } from "../../../../core/services/auth";
import { ClientInsightBorrowStatisticsComponent } from "./statistics/borrow";


@Component({
    selector: "app-client-insight",
    standalone: true,
    imports: [
        ClientInsightBorrowStatisticsComponent
    ], 
    templateUrl: "./index.html",
})

export class ClientInsightComponent {

    private insightService = inject(InsightService);
    private messageService = inject(MessageService);
    private authService = inject(AuthService);
    User = signal<any>(null)
    public isDataLoading = signal(false);
    public InsightCounts = signal<IClientInsightCounts>({
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
        this.User = this.authService.User;
        if (!this.User()) {
            this.authService.checkAuth().subscribe();
        }
        this.fetchAdminInsightCounts()
    }

    fetchAdminInsightCounts() {
        this.isDataLoading.set(true);
        this.insightService.getClientInsightCounts(this.User()?.id || 0)
            .subscribe({
                next: res => {
                    this.InsightCounts.set(res.data);
                    this.isDataLoading.set(false);
                },
                error: err => {
                    this.messageService.add({
                        severity: "error",
                        summary: "Error",
                        detail: err.error?.message
                    });
                    this.isDataLoading.set(false);
                }
            })
    }
} 