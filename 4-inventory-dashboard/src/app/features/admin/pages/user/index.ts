import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { TabsModule } from "primeng/tabs";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { AvatarModule } from "primeng/avatar";

import { IUserResponse } from "../../../../shared/interface/users";
import { UserService } from "../../../../core/services/user";

interface IFilterOptions {
  row_count: number;
  page_no: number;
}

// ✅ NO NULL HERE
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
    RouterLink,
    FormsModule,
    CommonModule,
    TabsModule,
    TableModule,
    TooltipModule,
    DialogModule,
    ButtonModule,
    AvatarModule,
  ],
  templateUrl: "./index.html",
})
export class AdminUserComponent implements OnInit {
  private userService = inject(UserService);

  public tabvalue = signal<number>(1);
  public userList = signal<IUserResponse[]>([]);
  public filterOptions = signal<IFilterOptions>({
    row_count: 10,
    page_no: 1,
  });
 
  public dialogState = signal<{
    visible: boolean;
    type?: DialogType;
    data?: IUserResponse;
  }>({
    visible: false,
  }); 

  ngOnInit(): void {
    this.userService.getAllClient("users").subscribe({
      next: (res) => {
        this.userList.set(res.data);
      },
      error: (err) => console.log("userListError", err),
    });
  }

  handleAddUser(){

  }

  // ✅ Open Dialog
  openDialog(type: DialogType, user?: IUserResponse) {
    this.dialogState.set({
      visible: true,
      type,
      data: user,
    });
  }

  // ✅ Close Dialog
  closeDialog() {
    this.dialogState.set({
      visible: false,
    });
  }
}
