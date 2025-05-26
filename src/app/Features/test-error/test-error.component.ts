import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-test-error',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './test-error.component.html',
  styleUrl: './test-error.component.css'
})
export class TestErrorComponent {
  baseUrl = 'https://localhost:7242/api/'

  private http = inject(HttpClient)

  get404Error() {
    this.http.get(this.baseUrl + 'Buggy/not-found').subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    });
  }

  get400BadRequest() {
    this.http.get(this.baseUrl + 'Buggy/bad-request').subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    });
  }

  get401Unauthorized() {
    this.http.get(this.baseUrl + 'Buggy/unauthorized').subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    });
  }

  get400ValidationError() {
    this.http.post(this.baseUrl + 'Buggy/validation-error',{}).subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    });
  }
  
  get500ServerError() {
    this.http.get(this.baseUrl + 'Buggy/server-error').subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    });
  }
}