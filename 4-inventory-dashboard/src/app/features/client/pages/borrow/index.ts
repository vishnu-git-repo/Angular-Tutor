import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, skip, takeUntil } from 'rxjs/operators';

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
import { BorrowService } from "../../../../core/services/borrow";
import { IAcceptBorrowRequest, IGetAdminBorrowRequest, IGetClientBorrowRequest } from "../../../../shared/interface/borrows";
import { Colors } from "../../../../shared/colors";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../../core/services/auth";

@Component({
    selector: "app-client-borrow",
    standalone: true,
    imports: [
        RouterModule,
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
        TextareaModule,
    ],
    templateUrl: "./index.html",
})

export class ClientBorrowComponent {

    Math = Math

    private searchSubject = new Subject<string>();
    private destroySubject = new Subject<void>();
    private borrowService = inject(BorrowService);
    private authService = inject(AuthService)
    private router = inject(Router);

    User = this.authService.User();

    public acceptPayload = signal<IAcceptBorrowRequest>({
        BorrowId: 0,
        UserId: 0,
        PreRemarks: ""
    });

    public Dialog = signal<{
        approve: boolean,
        accept: boolean
    }>({
        accept: false,
        approve: false
    })

    public isLoading = signal<boolean>(false);
    public borrowList = signal<any>([]);
    public Counts = signal<{
        Requested: number;
        Accepted: number;
        Assigned: number;
        Pending: number;
        Paid: number;
        Approved: number;
        Waitlisted: number;
        Ack: number;
        Closed: number;
    }>({
        Requested: 0, Accepted: 0, Assigned: 0, Pending: 0, Paid: 0, Approved: 0, Waitlisted: 0, Ack: 0, Closed: 0
    })

    public initialPaginator: IGetClientBorrowRequest = {
        RowCount: 10,
        PageNo: 1,
        Status: 0,
        UserId: 0,
        SearchString: "",
        TotalCount: 0
    };
    public paginatorState = signal<IGetClientBorrowRequest>(this.initialPaginator);


    ngOnInit(): void {
        this.fetchBorrows();
        this.searchSubject
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                skip(1),
                takeUntil(this.destroySubject)
            )
            .subscribe(searchTerm => {
                this.paginatorState.update(state => ({
                    ...state,
                    SearchString: searchTerm,
                    PageNo: 1
                }));
                this.fetchBorrows();
            });
    }

    ngOnDestroy(): void {
        this.destroySubject.next();
        this.destroySubject.complete();
    }

    fetchBorrows() {
        this.isLoading.set(true);
        this.borrowService.getClientBorrows(this.paginatorState())
            .subscribe({
                next: res => {
                    this.Counts.set(res.data.statusCounts);
                    this.paginatorState.update(state => ({ ...state, TotalCount: res.data.totalCount }));
                    this.borrowList.set(res.data.items);
                },
                error: err => console.log(err)
            });
        this.isLoading.set(false);
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


    // Tab
    onStatusTab(num: number) {
        this.paginatorState.update(state => ({
            ...state,
            Status: num,
            PageNo: 1
        }))
        this.fetchBorrows();
    }


    // Pagination
    goToFirstPage() {
        if (this.isFirstPage()) return;
        this.paginatorState.update(state => ({ ...state, PageNo: 1 }));
        this.fetchBorrows();
    }

    goToPreviousPage() {
        if (this.isFirstPage()) return;
        this.paginatorState.update(state => ({ ...state, PageNo: state.PageNo - 1 }));
        this.fetchBorrows();
    }

    goToNextPage() {
        if (this.isLastPage()) return;
        this.paginatorState.update(state => ({ ...state, PageNo: state.PageNo + 1 }));
        this.fetchBorrows();
    }

    goToLastPage() {
        if (this.isLastPage()) return;
        if (this.paginatorState().Status == 1)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Requested ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else if (this.paginatorState().Status == 2)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Accepted ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else if (this.paginatorState().Status == 3)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Assigned ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else if (this.paginatorState().Status == 4)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Pending ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else if(this.paginatorState().Status==5)
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Paid ?? 0) / (this.paginatorState().RowCount ?? 1))}) );
        else if(this.paginatorState().Status==6)
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Approved ?? 0) / (this.paginatorState().RowCount ?? 1))}) );
        else if(this.paginatorState().Status==7)
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Waitlisted ?? 0) / (this.paginatorState().RowCount ?? 1))}) );
        else if(this.paginatorState().Status==8)
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Ack ?? 0) / (this.paginatorState().RowCount ?? 1))}) );
        else if(this.paginatorState().Status==9)
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.Counts().Closed ?? 0) / (this.paginatorState().RowCount ?? 1))}) );
        else 
            this.paginatorState.update( state => ({ ...state, PageNo: Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))}) );

        this.fetchBorrows();
    }

    onRowChange(n: number) {
        this.paginatorState.update(state => ({ ...state, RowCount: n }));
        this.fetchBorrows();
    }

    isFirstPage() {
        return this.paginatorState().PageNo == 1 ?
            true : false;
    }

    isLastPage() {
        if (this.paginatorState().Status == 1)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Requested ?? 0) / (this.paginatorState().RowCount ?? 1));
        else if (this.paginatorState().Status == 2)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Accepted ?? 0) / (this.paginatorState().RowCount ?? 1));
        else if (this.paginatorState().Status == 3)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Assigned ?? 0) / (this.paginatorState().RowCount ?? 1));
        else if (this.paginatorState().Status == 4)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Pending ?? 0) / (this.paginatorState().RowCount ?? 1));
        else if (this.paginatorState().Status == 5)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Paid ?? 0) / (this.paginatorState().RowCount ?? 1));
        else if (this.paginatorState().Status == 6)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Approved ?? 0) / (this.paginatorState().RowCount ?? 1));
        else if (this.paginatorState().Status == 7)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Waitlisted ?? 0) / (this.paginatorState().RowCount ?? 1));
        else if (this.paginatorState().Status == 8)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Ack ?? 0) / (this.paginatorState().RowCount ?? 1));
        else if (this.paginatorState().Status == 9)
            return this.paginatorState().PageNo == Math.ceil((this.Counts().Closed ?? 0) / (this.paginatorState().RowCount ?? 1));
        else
            return this.paginatorState().PageNo == Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1));
    }

    // Dialog
    openDialog(type: string) {

    }

    // Actions
    handleViewBorrow(id: number) {
        this.router.navigate(['/client/borrows/view', id]);
    }
    handleAcceptBorrow(id: number, userId: number) {
        this.acceptPayload.set({
            BorrowId: id,
            UserId: userId,
            PreRemarks: "Approved your Request!"
        });
        this.Dialog.update(state => ({ ...state, accept: !state.accept }))
    }
    handleApproveBorrow(id: number) {

    }

    // Service
    acceptBorrowService() {
        this.borrowService.putAcceptBorrow(this.acceptPayload()).subscribe({
            next: res => {
                console.log(res);
                this.Dialog.update(state => ({ ...state, accept: !state.accept }));
                this.fetchBorrows();
            },
            error: err => console.log(err)
        });


        // do your Ideas here... I want remove the borrow items in list and change the counts.. requested-1 and accepted+1.. because it goes to next tab
    }
}