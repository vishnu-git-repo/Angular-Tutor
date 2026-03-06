import { Component, Input, OnInit, signal } from "@angular/core";
import { CommonModule} from "@angular/common";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { Colors,} from "../../../../../../shared/colors";
import { IUserCounts } from "../../../../../../shared/interface/insight/admin";


interface IUserCountsResponse {
    Total: number,
    Active: number,
    Inactive: number
}

@Component({
    selector: "app-admin-insight-user-statistics",
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FormsModule
    ],
    templateUrl: "./index.html"
})
export class AdminInsightUserStatisticsComponent implements OnInit {

    @Input() data!: IUserCounts;
    // @Input() load!: boolean;

    public isDataLoading = signal<boolean>(false);
    public userCounts = signal<IUserCounts>(this.data)
    
    public animateBars = signal(false);

    ngAfterViewInit() {
        setTimeout(() => {
            this.animateBars.set(true);
        }, 100);
    }

    ngOnInit(): void {
        this.fetchUsers();
    }
    fetchUsers() {

    }

    getPercentage(value: number): number {
        const total = this.data.total || 1;
        const percentage = (value / total) * 100;
        return Number(percentage.toFixed(2));
    }

    getStatusStyle(status: string) {

        const map: Record<string, keyof typeof Colors> = {
            Active: "success",
            Inactive: "red"
        };

        return Colors[map[status] || "neutral"];

    }
    get statusList() {
        return [
            { key: "Active", value: this.data.status.Active },
            { key: "Inactive", value: this.data.status.Inactive },
        ];

    }
}