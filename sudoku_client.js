var sudokus=[];
var current_pos=0;
var keyset=[37,38,39,40,49,50,51,52,53,54,55,56,57,58,27];
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
  var out="<style>body {text-align:left;font:22px 'Lucidia Console', Monaco, monospace}</style><div id=text></div><a href=javascript:send('NEW')>NEW</a> <a href=javascript:send('INIT')>INIT</a>";
  grid.innerHTML=out; 
}

function change_pos(d) {
  var new_pos=current_pos+d;
  if (d==1 && current_pos%9==8) {new_pos=current_pos}
  if (d==-1 && current_pos%9==0) {new_pos=current_pos}
  if (new_pos<81 && new_pos>=0) {current_pos=new_pos}
  tweet();
}

document.onkeydown = function(event) {
  if (keyset.indexOf(event.keyCode)>=0) {
    switch (event.keyCode) {
      case 37: change_pos(-1); break; // LEFT
      case 38: change_pos(-9); break; // UP
      case 39: change_pos(1); break; // RIGHT
      case 40: change_pos(9); break; // DOWN
      case 49: send('{"pos":'+current_pos+',"digit":1}'); break; // 1
      case 50: send('{"pos":'+current_pos+',"digit":2}'); break; // 2
      case 51: send('{"pos":'+current_pos+',"digit":3}'); break; // 3
      case 52: send('{"pos":'+current_pos+',"digit":4}'); break; // 4
      case 53: send('{"pos":'+current_pos+',"digit":5}'); break; // 5
      case 54: send('{"pos":'+current_pos+',"digit":6}'); break; // 6
      case 55: send('{"pos":'+current_pos+',"digit":7}'); break; // 7
      case 56: send('{"pos":'+current_pos+',"digit":8}'); break; // 8
      case 57: send('{"pos":'+current_pos+',"digit":9}'); break; // 9
      case 58: send('{"pos":'+current_pos+',"digit":0}'); break; // 0
      case 27: send('INIT'); break; // ESC (QUIT/START)
    }
    event.cancelBubble = true;
    event.returnValue = false;
  }
  return event.returnValue;
}

function send(msg) {ws.send(msg)}

function ws_open(url) {
  tweet('[CONNECTING WEBSOCKET-SERVER '+url+']');
  try {ws=new WebSocket(url)} catch (err){alert(err);ws=false};
  if (ws) {
    ws.onopen = function () {send('STATUS')};
    ws.onmessage = function (message) {
      //var current_sudoku = sudokus.find(s => s.id === 2);
      sudokus=JSON.parse(message.data);
      sudokus.forEach((s)=>{tweet('#'+s.id+': '+s.user_puzzle)});
    }
  }
  return ws;
}
