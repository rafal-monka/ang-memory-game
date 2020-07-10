import { Injectable } from '@angular/core';

@Injectable()
export class Utils {

  //#https://realtimelogic.com/articles/Creating-SinglePage-Apps-with-the-Minnow-Server
  httpToWs() {
      const l = window.location;
      let wsURL = '';
      // Start by working out if the calling URL was secure or not.
      if (l.protocol === 'https:') {
          wsURL = wsURL.concat('wss://');
      } else {
          wsURL = wsURL.concat('ws://');
      }
      // Concatenate the hostname onto the URL.
      wsURL = wsURL.concat(l.hostname);
      // Now process any non-standard port numbers.
      if  (l.port !== "80" && l.port !== "443" && l.port.length !== 0) {
          let port = (l.port === "4200") ? "8080" : l.port
          wsURL = wsURL.concat(':' + port);
      }
      // Now add in anything left in the way of a path part of the URL.
      wsURL = wsURL.concat(l.pathname);
      // Return the WebSocket URL we have created.
      return(wsURL);
  };
}
