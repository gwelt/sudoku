'use strict';
//var sudoku_solver = require('./sudoku_solver.js');
var sudoku_generator = require('./sudoku_generator.js');
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const PORT = process.env.PORT || 3003;
const INDEX = path.join(__dirname, 'index.html');
const CLIENTJS = path.join(__dirname, 'sudoku_client.js');
const server = express()
  .use((req, res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    if (req.url=="/") {res.sendFile(INDEX)}
    if (req.url=="/sudoku_client.js") {res.sendFile(CLIENTJS)}
  })
  .listen(PORT, function() {process.stdout.write(`\x1b[44m SUDOKU SERVER LISTENING ON PORT ${ PORT } \x1b[0m `)});
const wss = new SocketServer({ server });

///--- MAIN ---///
var sudokus=[];
var sudokuID=0;

///--- SUDOKU-CLASS ---///
function Sudoku() {
  sudokus.pop();
  sudokus.push(this);
  this.id=++sudokuID;
  var sudoku=sudoku_generator.generate();
  this.puzzle=sudoku[0];
  this.solution=sudoku[1];
  this.init();
}

Sudoku.prototype.init = function () {
  this.user_puzzle=this.puzzle;
  broadcast(JSON.stringify(sudokus));
}

Sudoku.prototype.set = function (pos,digit) {
  var new_user_puzzle=this.user_puzzle.substr(0,pos)+digit+this.user_puzzle.substr(pos+1,81-pos-1);
  this.user_puzzle=new_user_puzzle;
  console.log('SET: '+pos+'='+digit);
  broadcast(JSON.stringify(sudokus));
}

new Sudoku();

///--- CONNECTION-HANDLER ---///
function broadcast(text) {try{wss.clients.forEach((ws) => {ws.send(text)})} catch(err){};}
wss.on('connection', (ws) => {
  //var current_sudoku = sudokus.find(s => s.id === 1);
  ws.on('message', (msg) => {
    var request='';
    try {
      console.log('JSON: '+msg);
      request=JSON.parse(msg);
      request.pos=parseInt(request.pos);
      request.digit=parseInt(request.digit);
      if (80>request.pos<0) {request=''}
      if (10>request.digit<1) {request=''}
      if (request != '') {sudokus[0].set(request.pos,request.digit)};
    } catch (e) {
      console.log('INPUT: '+msg);
      if (msg=='STATUS') {ws.send(JSON.stringify(sudokus))}
      else if (msg=='INIT') {sudokus[0].init()}
      else if (msg=='NEW') {new Sudoku()}
    }
  });
});
