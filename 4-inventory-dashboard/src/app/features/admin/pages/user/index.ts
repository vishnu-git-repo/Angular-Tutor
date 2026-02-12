import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

@Component({
    selector: "app-admin-user",
    standalone: true,
    imports: [RouterLink, FormsModule, CommonModule], 
    templateUrl: "./index.html",
})

export class AdminUserComponent {

}