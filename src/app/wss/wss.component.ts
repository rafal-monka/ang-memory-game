import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

//import { AuthService } from '../auth/auth.service';
import { Utils } from '../utils';

@Component({
  selector: 'app-wss',
  templateUrl: './wss.component.html',
  styleUrls: ['./wss.component.css'],
  providers: [ /*AuthService,*/ Utils ]
})
export class WssComponent implements OnInit {

  hashkey: string
  messages: Array<any> = []
  text: string
  socket: WebSocket
  liveDataState: boolean
  token: string
  profile : any
  constructor(
    // private auth: AuthService,
    private utils: Utils) { }

  ngOnInit() {
      console.log('wss.component.ngOnInit()')
      //Auth0 token
      return;

      //####OFF
      // this.auth.getTokenSilently$().subscribe(res => {
      //     //console.log(res)
      //     this.token = res
      // })

      //Auth0 user profile
      this.auth.userProfile$.subscribe(data => {
          //console.log('USER', data)
          this.profile = data
      });
  }


  toggleLiveData() {
    console.log('toggleLiveData', this.liveDataState)
    if (this.liveDataState) {
        console.log('offLiveData, socket.close()')
        this.socket.close(1000, 'Web Socket connection closed manually')
    } else {
        this.socket = new WebSocket(this.utils.httpToWs()+"?user="+this.profile.sub+"&token="+this.token);
        this.turnOn(
            () => {
              this.messages.push('[CLIENT] callbackOnOpen')
              this.liveDataState = true
            },
            (msg) => {
                console.log('callback:', msg)
                this.messages.push(msg)
            },
            () => {
              this.messages.push('[CLIENT] callbackOnClose')
              this.liveDataState = false
            }
        )
    }

    console.log('toggleLiveData', this.liveDataState)
}

  sendText() {
      console.log(this.text)
      const payload = {
        token: 'TOKEN',
        msg: this.text,
    };
      this.socket.send( JSON.stringify({
        message: this.text,
        profile_sub: this.profile.sub
      }) )
  }

  private turnOn(callbackOnOpen, callbackOnMessage, callbackOnClose) {

      this.socket.onopen = function(e) {
  // console.log("[client] [on-open] Sending to server");
          callbackOnOpen()
      };

      this.socket.onmessage = function (event) {
  // console.log(`[client] [on-message] received from server: ${event.data}`);
          callbackOnMessage(event.data)
      }

      this.socket.onclose = function(event) {
          callbackOnClose()
          if (event.wasClean) {
              console.log(`[client]  Connection closed cleanly, code=${event.code} reason=${event.reason}`);
          } else {
              // e.g. server process killed or network down
              // event.code is usually 1006 in this case
              console.log('[close] Connection died');
          }
      };

      this.socket.onerror = function(error) {
          console.log('[error]', JSON.stringify(error));
      };
  }

  clearMessages() {
    this.messages.length = 0
  }

  //wss2
  // connect(): Observable<any> {
  //   return this.store.pipe(select(getApiUrl)).pipe(
  //     filter(apiUrl => !!apiUrl),
  //     // https becomes wws, http becomes ws
  //     map(apiUrl => apiUrl.replace(/^http/, 'ws') + '/stream'),
  //     switchMap(wsUrl => {
  //       if (this.connection$) {
  //         return this.connection$;
  //       } else {
  //         this.connection$ = webSocket(wsUrl);
  //         return this.connection$;
  //       }
  //     }),
  //     retryWhen((errors) => errors.pipe(delay(this.RETRY_SECONDS)))
  //   );
  // }

}
