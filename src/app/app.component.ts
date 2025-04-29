import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "./Layout/header/header.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
 
  title = 'CodeCart';
  baseUrl = 'https://localhost:7242/api/'

  private http = inject(HttpClient)

  ngOnInit(): void {
    this.http.get(this.baseUrl + 'products').subscribe({
      next:data=>console.log(data),
      error: error=>console.log(error),
      complete: ()=>console.log('completed')
    })
  }
}
