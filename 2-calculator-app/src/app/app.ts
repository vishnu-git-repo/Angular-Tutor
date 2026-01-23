import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // ✅ REQUIRED
  templateUrl: './app.html',
})
export class App {
  current = '';

  append(value: string) {
    if (value === '.' && this.current.endsWith('.')) return;
    this.current += value;
  }

  setOperator(op: string) {
    if (!this.current) return;

    if (/[+\-*/%]$/.test(this.current)) {
      this.current = this.current.slice(0, -1);
    }

    const map: Record<string, string> = {
      '+': '+',
      '-': '-',
      '×': '*',
      '%': '/',
    };

    this.current += map[op];
  }

  clearAll() {
    this.current = '';
  }

  clearLast() {
    this.current = this.current.slice(0, -1);
  }

  calculate() {
    try {
      // eslint-disable-next-line no-eval
      this.current = eval(this.current).toString();
    } catch {
      this.current = 'Error';
    }
  }
}
