import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { Observable } from 'rxjs/Observable';
import { Socket } from 'ng-socket-io';

@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GamePage {
  player1:string = "";
  player2:string = "";
  piece:string = "";
  username:string = "";
  canStart:boolean = false;
  turn:boolean = false;
  board:any;

  constructor(public navCtrl: NavController, private navParams: NavParams, private socket: Socket) {
    this.board = [[" ", " ", " ", " ", " ", " ", " "],
                  [" ", " ", " ", " ", " ", " ", " "],
                  [" ", " ", " ", " ", " ", " ", " "],
                  [" ", " ", " ", " ", " ", " ", " "],
                  [" ", " ", " ", " ", " ", " ", " "],
                  [" ", " ", " ", " ", " ", " ", " "]];

    this.username = this.navParams.get('username');

    this.startGame().subscribe(data => {
      if (data['event'] == 'start') {
        this.player1 = data['player1'];
        this.player2 = data['player2'];

        if (this.player1 == this.username) {
          this.piece = "assets/imgs/red_circle.png";
          this.turn = true;
        } else {
          this.piece = "assets/imgs/yellow_circle.png";
          this.turn = false;
        }

        this.canStart = true;
      }
    });

    this.userLeaving().subscribe(data => {
      console.log("Opponent Left...");
    });

    this.getMove().subscribe(data => {
      let column:number = data['column'];
      let name:string = data['username'];
      let piece:string = data['piece'];
      console.log('Getting move => column: ' + column + ', username: '+ name + ', piece: ' + piece);
      this.add(column, piece);
      if (name == this.username) {
        this.turn = false;
      } else {
        this.turn = true;
      }
    });
  }

  startGame() {
    let observable = new Observable(observer => {
      this.socket.on('start-game', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  userLeaving() {
    let observable = new Observable(observer => {
      this.socket.on('user-left', (username) => {
        observer.next(username);
      });
    });
    return observable;
  }

  sendMove(col:number) {
    if (this.canStart == true) {
      if (this.turn) {
        this.turn = !this.turn;
        console.log('Sending move => column: ' + col + ', username: '+ this.username + ', piece: ' + this.piece);
        this.socket.emit('add-move', {column: col, username: this.username, piece: this.piece});
      }
    } else {
      console.log('Waiting on user...');
    }
  }

  getMove() {
    let observable = new Observable(observer => {
      this.socket.on('move', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  add(col:number, piece:string) {
    console.log("Adding a piece to column: " + col);

    for (var row = 5; row >= 0; row--) {
      if (this.board[row][col] == " ") {
        this.board[row][col] = piece;
        this.checkWinner(piece);
        return;
      }
    }

    console.log("Column is full, pick another.");
  }

  checkWinner(p:string) {
    let player = "";
    if (p == this.piece) {
      if (this.username == this.player1) {
        player = this.player1;
      } else {
        player = this.player2;
      }
    } else {
      if (this.username == this.player1) {
        player = this.player2;
      } else {
        player = this.player1;
      }
    }

    //Diagonal Check Ascending
    for (var i = 3; i < 6; i++) {
      for (var j = 0; j < 3; j++) {
        if (this.board[i][j] == p && this.board[i-1][j+1] == p && this.board[i-2][j+2] == p && this.board[i-3][j+3] == p) {
          console.log(player + " WINS! - Diagonal Ascending");
        }
      }
    }

    //Diagonal Check Descending
    for (var i = 3; i < 6; i++) {
      for (var j = 3; j < 7; j++) {
        if (this.board[i][j] == p && this.board[i-1][j-1] == p && this.board[i-2][j-2] == p && this.board[i-3][j-3] == p) {
          console.log(player + " WINS! - Diagonal Descending");
        }
      }
    }

    //Horizontal Check
    for (var i = 0; i < 6 ; i++ ) {
      for (var j = 0; j < 4; j++) {
        if (this.board[i][j] == p && this.board[i][j+1] == p && this.board[i][j+2] == p && this.board[i][j+3] == p){
          console.log(player + " WINS! - Horizontally");
        }
      }
    }
    
    //Vertical Check
    for (var i = 0; i < 3 ; i++ ) {
      for (var j = 0; j < 7; j++) {
        if (this.board[i][j] == p && this.board[i+1][j] == p && this.board[i+2][j] == p && this.board[i+3][j] == p){
          console.log(player + " WINS! - Vertically");
        }           
      }
    }
  }

  ionViewWillLeave() {
    this.socket.disconnect(this.username);
  }

}
