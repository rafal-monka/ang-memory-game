import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from './models/user';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  ping$(): Observable<any> {
    return this.http.get('/api/external');
  }

  game$(gameid): Observable<any> {
    return this.http.get(`/api/game/${gameid}`);
  }

  newGame$(user: User): Observable<any> {
    return this.http.post('/api/game', {
      user: user
    });
  }

  resumeGame$(gameid, obj): Observable<any> {
    return this.http.put(`/api/game/${gameid}`, obj);
  }

  addPlayer$(gameid, userid, email, name, level): Observable<any> {
    return this.http.put('/api/game/player', {
      gameid: gameid,
      userid: userid,
      email: email,
      name: name,
      level: level
    });
  }

  removePlayer$(gameid, email): Observable<any> {
    return this.http.request('delete', '/api/game/player', { body: {
      gameid: gameid,
      email: email
    }});
  }
}
