import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';

import { GamePage } from '../game/game';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  username:string;

  constructor(public navCtrl: NavController, private socket: Socket) {

  }

  connect() {
    if (this.username == null || this.username == "") {
      console.log("Username is null/empty");
      return;
    }

    this.socket.connect();
    this.socket.emit('queue', this.username);
    //this.socket.emit('set-nickname', this.username);
    this.navCtrl.push(GamePage, {
      username: this.username
    });
  }
}
