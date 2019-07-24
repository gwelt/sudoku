'use strict';
var sudoku_generator = require('./sudoku_generator.js');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {'path': '/sudoku/socket.io'});
var bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 3003;

server.listen(PORT, function() {process.stdout.write(`\x1b[44m SUDOKU SERVER LISTENING ON PORT ${ PORT } \x1b[0m \n`)});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('(/sudoku)?/$', function(req,res) {res.sendFile(path.join(__dirname, 'index.html'))}); //res.setHeader('Access-Control-Allow-Origin','*');
app.use('(/sudoku)?/sudoku_client.js', function(req,res) {res.sendFile(path.join(__dirname, 'sudoku_client.js'))});
app.use('(/sudoku)?/api/init$', function(req,res) {sudoku.init();res.send(JSON.stringify(sudoku))});
app.use('(/sudoku)?/api/reset$', function(req,res) {sudoku.reset();res.send(JSON.stringify(sudoku))});
app.use('(/sudoku)?/api/get$', function(req,res) {res.send(JSON.stringify(sudoku))});

function Sudoku() {
  this.init();
}

Sudoku.prototype.init = function () {
  var sudoku=sudoku_generator.generate();
  this.puzzle=sudoku[0];
  this.solution=sudoku[1];
  this.reset();
}

Sudoku.prototype.reset = function () {
  this.current=this.puzzle;
  broadcast(this);
}

Sudoku.prototype.set = function (pos,digit) {
  if ( (81>pos>=0) && (/^[0-9]$/.test(digit)) ) {
    if (this.puzzle[pos]=='-') {
      if (digit==0) {digit='-'}
      this.current=this.current.substr(0,pos)+digit+this.current.substr(pos+1,81-pos-1);
      //log('SET '+pos+'='+digit);
      broadcast(this);
    }
  }
}

var sudoku=new Sudoku();

function broadcast() {try{io.sockets.emit('sudoku',JSON.stringify(sudoku))} catch(err){};}

io.on('connection', (socket) => {
  socket.emit('sudoku',JSON.stringify(sudoku));
  socket.on('put', (msg) => {sudoku.set(msg.pos,msg.digit)});
  socket.on('init', (msg) => {sudoku.init()});
  socket.on('reset', (msg) => {sudoku.reset()});
});

function log(m) {
  console.log(m);
}