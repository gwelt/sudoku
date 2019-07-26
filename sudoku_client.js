var current_pos=0;
var current_sudoku=undefined;
var keyset=[37,38,39,40,48,49,50,51,52,53,54,55,56,57,27,8];
init();

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
  socket.on('sudoku', function (msg) {log(msg); current_sudoku=JSON.parse(msg); update()});
  socket.on('message', function (msg) {log(msg)});
  socket.on('disconnect', function (msg) {socket.close(); log('DISCONNECTED '+msg)});
})}};

function send_digit(digit) {send_message('put',{'pos':current_pos,'digit':digit})}
function send_message(type,m) {
  if (socket) {socket.emit(type||'message',m)} 
}

function init() {
  var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  var s=50;
  if (width>height) {s=(height-50)/10} else {s=(width-50)/10};
  var fs=s/2.25;

  var g='';
  g+="<style>body {font:"+fs+"px 'Lucidia Console', Monaco, monospace; margin:25px 0px 0px 0px;}</style>";

  g+='<style>.wallpaper {display:table;text-align:center;margin:auto}</style>';
  g+='<style>.modal {display:none; justify-content:space-around; width:10px; height:10px; position:absolute; text-align:center; margin:auto; background-color:rgba(255, 255, 255, 1);}</style>';

  g+='<style>.space {float:left;width:4px;height:4px}</style>';
  g+='<style>.cr {clear:both}</style>';
  g+='<style>.f {cursor:pointer;float:left;text-align:center;display:table;margin:1px;width:'+s+'px;height:'+s+'px;}</style>';
  g+='<style>.f2 {cursor:pointer;float:left;text-align:center;display:table;margin:6px;width:'+s*2.8+'px;height:'+s*2+'px;font-size:3em;}</style>';
  g+='<style>.tc {display:table-cell;vertical-align:middle}</style>';

  g+='<div id=wallpaper class=wallpaper>';

  g+='<div id=modal class=modal><div class=tc>';
  var i=1;
  while (i<10) {
    g+='<div class=f2><div id=put'+i+' class=tc onclick=javascript:send_digit('+i+');javascript:document.getElementById("modal").style.display="none">'+i+'</div></div>';
    if (i%3==0) {g+='<div class=cr></div>'}
    i++;
  }
  g+='<div class=f2><div id=back class=tc onclick=javascript:document.getElementById("modal").style.display="none">&lt;</div></div>';
  g+='<div class=f2><div></div></div>';
  g+='<div class=f2><div id=put0 class=tc onclick=javascript:send_digit(0);javascript:document.getElementById("modal").style.display="none">-</div></div>';
  g+='</div></div>';

  var i=0;
  while (i<81) {
    if (i%9==0) {g+='<div class=space></div><div class=cr></div>'}
    if (i%3==0) {g+='<div class=space></div>'}
    g+='<div id='+i+' class=f></div>';
    i++;
    if (i%27==0) {g+='<div class=cr></div>'}
  }
  g+='<div class=cr></div><div class=space></div></div>';

  var grid=document.getElementById("sudoku");
  grid.style.textAlign='left';
  grid.innerHTML=g;

  document.getElementById('modal').style.width=document.getElementById('wallpaper').offsetWidth+'px';
  document.getElementById('modal').style.height=document.getElementById('wallpaper').offsetHeight+'px';

  update();
}

function update() {
  var i=0;
  while ((current_sudoku)&&(i<81)) {
    var e=document.getElementById(i);
    if (current_sudoku.current) {
      if (current_sudoku.puzzle[i]>0) {e.style.color='#000'} else {e.style.color='#080'}
      if (i==current_pos) {e.style.background='#cfc'} else {e.style.background='#fafafa'}
      e.innerHTML='<div class=tc onclick=modal('+i+')>'+(current_sudoku.current[i]>0?current_sudoku.current[i]:'')+'</div>';
    }
    i++;
    if (i==81) {document.getElementById('wallpaper').style.background='#ccc'};
  }
  //document.getElementById('text').innerHTML="current_pos="+current_pos+"<br>";
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
      case 27: send_digit(0); break; // ESC
      case 8: send_digit(0); break; // BACKSPACE
    }
    event.cancelBubble = true;
    event.returnValue = false;
  }
  return event.returnValue;
}

function modal(p) {
  current_pos=p;
  if (current_sudoku.puzzle[current_pos]=='-') {
    if (current_sudoku.current[current_pos]=='-') {document.getElementById('put0').style.background='#cfc'} else {document.getElementById('put0').style.background='#ddd'};
    document.getElementById('back').style.background='#ddd';
    var i=1;
    while (i<10) {
      var e=document.getElementById('put'+i);
      if (current_sudoku.current[current_pos]==i) {e.style.background='#beb'} else {e.style.background='#ddd'}
      i++;
    }
    document.getElementById('modal').style.display='flex';
  }
  update();
}

function change_pos(d) {
  var new_pos=current_pos+d;
  if (d==1 && current_pos%9==8) {new_pos=current_pos}
  if (d==-1 && current_pos%9==0) {new_pos=current_pos}
  if (new_pos<81 && new_pos>=0) {current_pos=new_pos}
  update();
}

function log(m) {console.log(m)}
