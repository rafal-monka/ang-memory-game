import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.css']
})
export class NewGameComponent implements OnInit {

  selectedTheme: string
  themes: Array<any>

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.api.themes$().subscribe(themes=>{
      this.themes = themes
      this.selectedTheme = this.themes[0].name
    })
  }

  newGame() {
    console.log(this.selectedTheme)
    this.router.navigate(['/game'], { queryParams: { theme: this.selectedTheme } })//   /theme', this.selectedTheme]);
  }
}
