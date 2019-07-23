var current_sudoku_id=false;
var current_sudoku=false;
var current_pos=0;
var keyset=[37,38,39,40,48,49,50,51,52,53,54,55,56,57,27];
var tweets=[];
init_grid();

var socket=false;
var useSocketIO=true;

function loadScript(src, done) {
  var js = document.createElement('script');
  js.src = src;
  js.onload = function() {done(src+' executed')};
  document.head.appendChild(js);
}
if (useSocketIO) {setTimeout(function(){SocketIO()},0)};

function SocketIO() {if (!socket) {loadScript('/sudoku/socket.io/socket.io.js', function() {
  socket = io.connect('', { 'path': '/sudoku/socket.io' });
  socket.on('sudoku', function (msg) {log(msg)});
  socket.on('message', function (msg) {log(msg)});
  socket.on('disconnect', function (msg) {socket.close(); log('DISCONNECTED '+msg)});
})}};

function send_digit(digit) {send_message('put',{'pos':current_pos,'digit':digit})}
function send_message(type,m) {
  if (socket) {socket.emit(type||'message',m)} 
  //else {var req = new XMLHttpRequest(); var hostname_port=location.hostname+":3000/255"; req.open('GET','http://'+hostname_port+'/m/'+m); req.send(); alert('Message delivered.')}
}

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
  var out="<style>body {text-align:left;font:22px 'Lucidia Console', Monaco, monospace}</style><div id=text></div> <a href=javascript:send_message('init','')>INIT</a> <a href=javascript:send_message('reset','')>RESET</a>";
  grid.innerHTML=out;
  tweet(); 
}

document.onkeydown = function(event) {
  if (keyset.indexOf(event.keyCode)>=0) {
    switch (event.keyCode) {
      case 37: change_pos(-1); break; // LEFT
      case 38: change_pos(-9); break; // UP
      case 39: change_pos(1); break; // RIGHT
      case 40: change_pos(9); break; // DOWN
      case 48: send_digit(0); break; // 0 -
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

function log(m) {
  console.log(m);
}