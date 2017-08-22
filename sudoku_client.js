var current_sudoku_id=false;
var current_sudoku=false;
var current_pos=0;
var keyset=[37,38,39,40,49,50,51,52,53,54,55,56,57,27];
var tweets=[];
init_grid();
var ws=ws_open(location.origin.replace(/^http/, 'ws')+'/socket');

function tweet(t) {
  if (t) {tweets.push(t)}
  while (tweets.length>1) {tweets.splice(0,1)}
  var etweet=document.getElementById('text');
  if (etweet) {
    etweet.innerHTML="current_pos="+current_pos+"<br>";
    tweets.forEach(function(tt) {etweet.innerHTML+=tt+"<br>"});
  };
}

function init_grid () {
  var grid=document.getElementById("grid");
  grid.style.textAlign='left';
  var out="<style>body {text-align:left;font:22px 'Lucidia Console', Monaco, monospace}</style><div id=text></div><a href=javascript:select_current_sudoku(1)>1</a> <a href=javascript:select_current_sudoku(2)>2</a> <a href=javascript:select_current_sudoku(3)>3</a> <a href=javascript:select_current_sudoku(undefined)>INIT</a>";
  grid.innerHTML=out; 
}

document.onkeydown = function(event) {
  if (keyset.indexOf(event.keyCode)>=0) {
    switch (event.keyCode) {
      case 37: change_pos(-1); break; // LEFT
      case 38: change_pos(-9); break; // UP
      case 39: change_pos(1); break; // RIGHT
      case 40: change_pos(9); break; // DOWN
      case 49: send_digit(1); break; // 1
      case 50: send_digit(2); break; // 2
      case 51: send_digit(3); break; // 3
      case 52: send_digit(4); break; // 4
      case 53: send_digit(5); break; // 5
      case 54: send_digit(6); break; // 6
      case 55: send_digit(7); break; // 7
      case 56: send_digit(8); break; // 8
      case 57: send_digit(9); break; // 9
      case 27: select_current_sudoku(undefined); break; // ESC (QUIT/START)
    }
    event.cancelBubble = true;
    event.returnValue = false;
  }
  return event.returnValue;
}

function change_pos(d) {
  var new_pos=current_pos+d;
  if (d==1 && current_pos%9==8) {new_pos=current_pos}
  if (d==-1 && current_pos%9==0) {new_pos=current_pos}
  if (new_pos<81 && new_pos>=0) {current_pos=new_pos}
  tweet();
}

function select_current_sudoku(id) {
  current_sudoku=false;
  current_sudoku_id=id;
  send('{"id":"'+current_sudoku_id+'"}');
}

function send(msg) {ws.send(msg)}
function send_digit(digit) {if (current_sudoku) {send('{"id":'+current_sudoku_id+',"pos":'+current_pos+',"digit":'+digit+'}')} else {log('SELECT A SUDOKU FIRST!')}}

function ws_open(url) {
  tweet('[CONNECTING WEBSOCKET-SERVER '+url+']');
  try {ws=new WebSocket(url)} catch (err){alert(err);ws=false};
  if (ws) {
    ws.onopen = function () {select_current_sudoku(undefined)};
    ws.onmessage = function (message) {
      received_sudokus=JSON.parse(message.data);
      var updated_current_sudoku = received_sudokus.find(s => s.id == current_sudoku_id);
      if (updated_current_sudoku) {
        current_sudoku=updated_current_sudoku; tweet('<b>#'+current_sudoku.id+':</b> '+current_sudoku.user_puzzle)
        log('GOT UPDATE FOR CURRENT SUDOKU (#'+current_sudoku.id+')');
      } 
      else {
        received_sudokus.forEach((s)=>{tweet('#'+s.id+': '+s.user_puzzle)})
        log('GOT SUDOKU-UPDATES ('+received_sudokus.length+').');
      };
    }
  }
  return ws;
}

function log(m) {
  console.log(m);
}