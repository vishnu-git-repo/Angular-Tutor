import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


import { TabsModule } from "primeng/tabs";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { AvatarModule } from "primeng/avatar";
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';

import { IGetFilteredUserRequest, IUpdatePasswordRequest, IUpdateUserRequest, IUserResponse } from "../../../../shared/interface/users";
import { UserService } from "../../../../core/services/user";
import { GenderConstant } from "../../../../shared/constants";
import { AdminStore } from "../../../../shared/interface/cart";

interface IFilterOptions {
  row_count: number;
  page_no: number;
}

type DialogType =
  | "view"
  | "update"
  | "password"
  | "block"
  | "unblock"
  | "borrow";

@Component({
  selector: "app-admin-user",
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TabsModule,
    TableModule,
    TooltipModule,
    DialogModule,
    ButtonModule,
    AvatarModule,
    InputTextModule,
    IftaLabelModule,
    SelectModule,
    TextareaModule,
    ChipModule,
    SkeletonModule
  ],
  templateUrl: "./index.html",
})

export class AdminUserComponent implements OnInit {
  private userService = inject(UserService);
  private searchSubject = new Subject<string>();
  public tabvalue = signal<number>(0);
  public userList = signal<IUserResponse[]>([]);
  public isPageLoad = signal<boolean>(true);
  // public filterOptions = signal<IFilterOptions>({
  //   row_count: 10,
  //   page_no: 1,
  // });

  public dialogState = signal<{
    visible: boolean;
    type: DialogType;
    data?: IUserResponse;
  }>({
    visible: false,
    type: "view",
  });

  public paginatorState = signal<IGetFilteredUserRequest>({
    Status: 0,
    RowCount: 5,
    PageNo: 1,
    TotalCount: 20,
    BlockedCount: 0,
    ActiveCount: 0,
    SearchString: "",
  })

  public genders: string[] = GenderConstant;
  public password = signal<string>("Client@123");

  ngOnInit(): void {
    this.isPageLoad.set(true);
    this.fetchUsers();
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {

        this.paginatorState.update(state => ({
          ...state,
          SearchString: searchTerm,
          PageNo: 1  // reset to first page
        }));

        this.fetchUsers();
      });
  }

  fetchUsers() {
    const state = this.paginatorState();
    this.userService.getFilteredClient(state).subscribe({
      next: (res: any) => {
        this.userList.set(res.data.users);
        this.paginatorState.set({
          Status: res.data.status,
          RowCount: res.data.rowCount,
          PageNo: res.data.pageNo,
          TotalCount: res.data.totalCount,
          BlockedCount: res.data.blockedCount,
          ActiveCount: res.data.activeCount,
          SearchString: res.data.searchString
        });
        this.isPageLoad.set(false);
      },
      error: (err) => console.log("userListError", err),
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  handleAddUser() {

  }

  openDialog(type: DialogType, user?: IUserResponse) {
    this.dialogState.set({
      visible: true,
      type,
      data: user,
    });
  }

  closeDialog() {
    this.dialogState.set({
      visible: false,
      type: "view"
    });
  }

  cancelDialog() {
    this.dialogState.set({
      visible: false,
      type: "view"
    });
    this.fetchUsers();
  }

  goToFirstPage() {
    if (this.isFirstPage()) return;
    this.paginatorState.update(state => ({
      ...state,
      PageNo: 1
    }))
    this.fetchUsers();
  }
  goToPreviousPage() {
    if (this.isFirstPage()) {
      return;
    }
    this.paginatorState.update(state => ({
      ...state,
      PageNo: --this.paginatorState().PageNo
    }))
    this.fetchUsers();
  }
  goToNextPage() {
    if (this.isLastPage()) {
      return;
    }
    this.paginatorState.update(state => ({
      ...state,
      PageNo: ++this.paginatorState().PageNo
    }))
    this.fetchUsers();
  }
  goToLastPage() {
    if (this.isLastPage()) return;
    if (this.paginatorState().Status == 0) {
      this.paginatorState.update(state => ({
        ...state,
        PageNo: Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))
      }))
    } else if (this.paginatorState().Status == 1) {
      this.paginatorState.update(state => ({
        ...state,
        PageNo: Math.ceil((this.paginatorState().ActiveCount ?? 0) / (this.paginatorState().RowCount ?? 1))
      }))
    } else {
      this.paginatorState.update(state => ({
        ...state,
        PageNo: Math.ceil((this.paginatorState().BlockedCount ?? 0) / (this.paginatorState().RowCount ?? 1))
      }))
    }
    this.fetchUsers();
  }
  goToPage(page: number) { }

  OnRowChange(e: any) {
    this.paginatorState.update(state => ({
      ...state,
      RowCount: e,
      PageNo: 1
    }));
    this.fetchUsers();
  }

  isFirstPage() {
    return this.paginatorState().PageNo == 1 ?
      true : false;
  }
  isLastPage() {
    if (this.paginatorState().Status == 1) {
      return (this.paginatorState().PageNo == Math.ceil((this.paginatorState().ActiveCount ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
        true : false;
    } else if (this.paginatorState().Status == 2) {
      return (this.paginatorState().PageNo == Math.ceil((this.paginatorState().BlockedCount ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
        true : false;
    } else {
      return (this.paginatorState().PageNo == Math.ceil((this.paginatorState().TotalCount ?? 0) / (this.paginatorState().RowCount ?? 1))) ?
        true : false;
    }
  }

  onTabChange(i: number) {
    this.paginatorState.update(state => ({
      ...state,
      Status: i,
      PageNo: 1
    }));
    this.fetchUsers();
  }



  // CRUD
  handleUpdateUser(user: IUserResponse) {
    const payload: IUpdateUserRequest = {
      Name: user.name,
      Gender: user.gender || "",
      Phone: user.phone || "",
      Address: user.address || ""
    }
    this.userService.updateUser(user.id, payload).subscribe({
      next: res => {
        console.log("Update User Response", res);
        this.closeDialog();
      },
      error: err => {
        console.log("Update User Response", err);
        alert("Fails");
      }
    })
  }

  handleUpdatePassword(user: IUserResponse) {
    const payload: IUpdatePasswordRequest = {
      Email: user.email,
      Password: "",
      NewPassword: this.password()
    }
    this.userService.updatePasswordByAdmin(user.id, payload).subscribe({
      next: res => {
        console.log("Update UserPassword Response", res);
        this.closeDialog();
      },
      error: err => {
        console.log("Update UserPassword Response", err);
        alert("Fails");
      }
    })
  }

  handleBlockUser(user: IUserResponse) {
    const id = user.id;
    this.userService.blockClient(id).subscribe({
      next: res => {
        console.log("Block user Response", res);
        const updatedList = this.userList().map(u =>
          u.id === id ? { ...u, status: 2 } : u
        );
        this.userList.set(updatedList);
        this.paginatorState.update(state => ({
          ...state,
          ActiveCount: (state.ActiveCount ?? 0) - 1,
          BlockedCount: (state.BlockedCount ?? 0) + 1,
        }));
        this.closeDialog();
      },
      error: err => {
        console.log("Block user Response", err);
        alert("Fails");
      }
    })
  }
  handleUnBlockUser(user: IUserResponse) {
    const id = user.id;

    this.userService.unBlockClient(id).subscribe({
      next: res => {
        console.log("UnBlock user Response", res);
        const updatedList = this.userList().map(u =>
          u.id === id ? { ...u, status: 1 } : u
        );
        this.userList.set(updatedList);
        this.paginatorState.update(state => ({
          ...state,
          BlockedCount: (state.BlockedCount ?? 0) - 1,
          ActiveCount: (state.ActiveCount ?? 0) + 1
        }));
        this.closeDialog();
      },
      error: err => {
        console.log("UnBlock user Response", err);
        alert("Fails");
      }
    });
  }

  handleViewBorrows(user: IUserResponse) {

  }

  handleAddToStore(user: IUserResponse) {
    try {
      const adminStore = localStorage.getItem("adminStore");

      if (adminStore !== null) {
        const parsedStore: AdminStore = JSON.parse(adminStore);
        parsedStore.User = user;
        localStorage.setItem("adminStore", JSON.stringify(parsedStore));
      } else {
        const newStore: AdminStore = {
          User: user,
          Equipments: []
        }
        localStorage.setItem("adminStore", JSON.stringify(newStore));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }
}
