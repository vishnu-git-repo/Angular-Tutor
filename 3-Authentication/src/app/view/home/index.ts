import { Component, inject, OnInit } from '@angular/core';
import { AuthProvider } from '../../utils/auth.provider';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
})
export class Home implements OnInit {

  auth = inject(AuthProvider);

  ngOnInit() {
    this.auth.checkAuth();
  }
}
