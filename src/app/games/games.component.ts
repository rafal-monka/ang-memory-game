import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs'
import { ApiService } from '../api.service';
import { Game } from '../models/game';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

  games$: Observable<Game[]>

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
      this.games$ = this.api.games$()
  }
}
