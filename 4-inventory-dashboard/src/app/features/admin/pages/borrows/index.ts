import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

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
import { IAcceptBorrowRequest, IAdminPaymentRequest, IApproveBorrowRequest, IClosedBorrowRequest, IGetAdminBorrowRequest, IWaitlistBorrowRequest } from "../../../../shared/interface/borrows";
import { Colors, getBorrowStatusChip, getChip } from "../../../../shared/colors";
import { Router, RouterModule } from "@angular/router";
import { Badge } from "primeng/badge";
import { getDurationInDays } from "../../../../shared/lib/DateHelper";
import { BorrowStatus } from "../../../../shared/Enums/BorrowEnum";
import { MessageService } from "primeng/api";

@Component({
    selector: "app-admin-borrow",
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

export class AdminBorrowComponent {

    Math = Math;
    BorrowStatus = BorrowStatus;
    getBorrowStatusChip = getBorrowStatusChip
    getDuration = getDurationInDays;
    getChip = getChip;

    private searchSubject = new Subject<string>();
    private destroySubject = new Subject<void>();
    private borrowService = inject(BorrowService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    public acceptPayload = signal<IAcceptBorrowRequest>({
        BorrowId: 0,
        UserId: 0,
        Description: "Good Noon! We are accepted your request"
    });

    public paymentPayload = signal<IAdminPaymentRequest>({
        BorrowId: 0,
        UserId: 0,
        Description: "",
        PaidAmount: 0
    });

    public approvePayload = signal<IApproveBorrowRequest>({
        BorrowId: 0,
        UserId: 0,
        Description: "",
    });

    public waitlistPayload = signal<IWaitlistBorrowRequest>({
        BorrowId: 0,
        UserId: 0,
        Description: "",
    });

    public closePayload = signal<IClosedBorrowRequest>({
        BorrowId: 0,
        UserId: 0,
        Description: "",
    });



    public Dialog = signal<{
        approve: boolean,
        accept: boolean,
        payment: boolean,
        waitlist: boolean,
        close: boolean
    }>({
        accept: false,
        approve: false,
        payment: false,
        waitlist: false,
        close: false
    })

    public isLoading = signal<boolean>(false);
    public isAcceptingBorrow = signal<boolean>(false);
    public isPaymentProcessing = signal<boolean>(false);
    public isApprrovingBorrow = signal<boolean>(false);
    public isWaitlistingBorrow = signal<boolean>(false);
    public isClosingBorrow = signal<boolean>(false);

    public selectedBorrow = signal<any>({});

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

    public initialPaginator: IGetAdminBorrowRequest = {
        RowCount: 10,
        PageNo: 1,
        Status: 0,
        EquipmentId: 0,
        EquipmentItemId: 0,
        UserId: 0,
        SearchString: "",
        BorrowId: 0,
        TotalCount: 0
    };
    public paginatorState = signal<IGetAdminBorrowRequest>(this.initialPaginator);


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
        this.borrowService.getAdminBorrows(this.paginatorState())
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
        else if (this.paginatorState().Status == 5)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Paid ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else if (this.paginatorState().Status == 6)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Approved ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else if (this.paginatorState().Status == 7)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Waitlisted ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else if (this.paginatorState().Status == 8)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Ack ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else if (this.paginatorState().Status == 9)
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.Counts().Closed ?? 0) / (this.paginatorState().RowCount ?? 1)) }));
        else
            this.paginatorState.update(state => ({ ...state, PageNo: Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1)) }));

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


    // Actions
    handleViewBorrow(id: number) {
        this.router.navigate(['/admin/borrows/view', id]);
    }
    handleAcceptBorrow(id: number, userId: number) {
        this.acceptPayload.set({
            BorrowId: id,
            UserId: userId,
            Description: ""
        });
        this.Dialog.update(state => ({ ...state, accept: !state.accept }))
    }



    handlePaymentBorrow(borrow: any) {
        this.selectedBorrow.set(borrow)
        this.paymentPayload.set({
            UserId: borrow.userId,
            BorrowId: borrow.id,
            Description: "",
            PaidAmount: borrow.totalPrice
        });
        this.Dialog.update(state => ({ ...state, payment: true }));
    }

    handleApproveBorrow(borrow: any) {
        this.approvePayload.set({
            BorrowId: borrow.id,
            UserId: borrow.userId,
            Description: ""
        });
        this.Dialog.update(state => ({ ...state, approve: true }));
    }

    handleWaitlistBorrow(borrow: any) {
        this.waitlistPayload.set({
            BorrowId: borrow.id,
            UserId: borrow.userId,
            Description: ""
        });
        this.Dialog.update(state => ({ ...state, waitlist: true }));
    }

    handleCloseBorrow(borrow: any){
        this.closePayload.set({
            BorrowId: borrow.id,
            UserId: borrow.userId,
            Description: ""
        });
        this.Dialog.update(state => ({ ...state, close: true }));
    }

    // Service
    acceptBorrowService() {
        if (this.acceptPayload().Description == "") {
            this.messageService.add({
                severity: "error",
                summary: "Validation Error",
                detail: "Description is Required"
            });
            return;
        }
        this.isAcceptingBorrow.set(true);

        this.borrowService.putAcceptBorrow(this.acceptPayload()).subscribe({
            next: res => {
                console.log(res);
                this.Dialog.update(state => ({ ...state, accept: !state.accept }));
                this.fetchBorrows();
                this.messageService.add({
                    severity: "success",
                    summary: "Success",
                    detail: res.message
                });
                this.isAcceptingBorrow.set(false);
            },
            error: err => {
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: err.error?.message
                });
                this.isAcceptingBorrow.set(false);
            }
        });
    }

    adminPaymentService() {
        if (this.paymentPayload().Description == "") {
            this.messageService.add({
                severity: "error",
                summary: "Validation Error",
                detail: "Description is Required"
            });
            return;
        }
        if (this.paymentPayload().PaidAmount != this.selectedBorrow().totalPrice) {
            this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Enter valid amount"
            });
            return;
        }
        this.isPaymentProcessing.set(true);
        this.borrowService.putCollectCashBorrow(this.paymentPayload()).subscribe({
            next: res => {
                console.log(res);
                this.Dialog.update(state => ({ ...state, payment: false }));
                this.fetchBorrows();
                this.messageService.add({
                    severity: "success",
                    summary: "Success",
                    detail: res.message
                });
                this.isPaymentProcessing.set(false);
            },
            error: err => {
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: err.error?.message
                });
                this.isPaymentProcessing.set(false);
            }
        });
    }

    approveBorrowService() {
        if (this.approvePayload().Description == "") {
            this.messageService.add({
                severity: "error",
                summary: "Validation Error",
                detail: "Description is Required"
            });
            return;
        }
        this.isApprrovingBorrow.set(true);

        this.borrowService.putApproveBorrow(this.approvePayload()).subscribe({
            next: res => {
                console.log(res);
                this.Dialog.update(state => ({ ...state, approve: false }));
                this.fetchBorrows();
                this.messageService.add({
                    severity: "success",
                    summary: "Success",
                    detail: res.message
                });
                this.isApprrovingBorrow.set(false);
            },
            error: err => {
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: err.error?.message
                });
                this.isApprrovingBorrow.set(false);
            }
        });
    }

    waitlistBorrowService() {
        if (this.waitlistPayload().Description == "") {
            this.messageService.add({
                severity: "error",
                summary: "Validation Error",
                detail: "Description is Required"
            });
            return;
        }
        this.isWaitlistingBorrow.set(true);

        this.borrowService.putWaitlistBorrow(this.waitlistPayload()).subscribe({
            next: res => {
                this.Dialog.update(state => ({ ...state, waitlist: false }));
                this.fetchBorrows();
                this.messageService.add({
                    severity: "success",
                    summary: "Success",
                    detail: res.message
                });
                this.isWaitlistingBorrow.set(false);
            },
            error: err => {
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: err.error?.message
                });
                this.isWaitlistingBorrow.set(false);
            }
        });
    }

    closeBorrowService() {
        if (this.closePayload().Description == "") {
            this.messageService.add({
                severity: "error",
                summary: "Validation Error",
                detail: "Description is Required"
            });
            return;
        }
        this.isClosingBorrow.set(true);

        this.borrowService.putCloseBorrow(this.closePayload()).subscribe({
            next: res => {
                this.Dialog.update(state => ({ ...state, close: false }));
                this.fetchBorrows();
                this.messageService.add({
                    severity: "success",
                    summary: "Success",
                    detail: res.message
                });
                this.isClosingBorrow.set(false);
            },
            error: err => {
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: err.error?.message
                });
                this.isClosingBorrow.set(false);
            }
        });
    }

}