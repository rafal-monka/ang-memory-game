import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ProfileComponent } from './profile/profile.component';
import { ExternalApiComponent } from './external-api/external-api.component';
import { WssComponent } from './wss/wss.component';

import { StoreModule } from '@ngrx/store';
import { PlayerReducer } from './player.reducer';

import { PlayersViewComponent } from './players-view/players-view.component';
import { PlayerAddComponent } from './player-add/player-add.component';
import { GameComponent } from './game/game.component';
import { GameReducer } from './game.reducer';
import { UserReducer } from './user.reducer';
import { HomeComponent } from './home/home.component';

@NgModule({
   declarations: [
      AppComponent,
      NavBarComponent,
      ProfileComponent,
      ExternalApiComponent,
      WssComponent,
      PlayersViewComponent,
      PlayerAddComponent,
      GameComponent,
      HomeComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      FormsModule,
      StoreModule.forRoot({players: PlayerReducer, game: GameReducer, user: UserReducer})
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
