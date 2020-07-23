import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './auth/auth.guard';
import { InterceptorService } from './auth/interceptor.service';
import { ExternalApiComponent } from './external-api/external-api.component';
import { GamesComponent } from './games/games.component';
import { GameComponent } from './game/game.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'external-api', component: ExternalApiComponent, canActivate: [AuthGuard] },
  { path: 'games', component: GamesComponent, canActivate: [AuthGuard] }, //@@@AUTH0
  { path: 'game', redirectTo: 'game/', pathMatch: 'full', canActivate: [AuthGuard] }, //@@@AUTH0
  { path: 'game/:gameid', component: GameComponent, canActivate: [AuthGuard] }, //@@@AUTH0
  { path: 'test', component: HomeComponent},
  { path: "**", component : HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ]
})
export class AppRoutingModule { }
