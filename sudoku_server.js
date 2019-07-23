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
    if (req.url=="/new") {res.send(new Sudoku().puzzle);}
  })
  .listen(PORT, function() {process.stdout.write(`\x1b[44m SUDOKU SERVER LISTENING ON PORT ${ PORT } \x1b[0m `)});
const wss = new SocketServer({ server });

///--- MAIN ---///
var sudokus=[];
var sudokuID=0;

///--- SUDOKU-CLASS ---///
function Sudoku() {
  //sudokus.pop();
  sudokus.push(this);
  this.id=++sudokuID;
  var sudoku=sudoku_generator.generate();
  this.puzzle=sudoku[0];
  //this.solution=sudoku[1];
  this.init();
}

Sudoku.prototype.init = function () {
  this.user_puzzle=this.puzzle;
  broadcast(this);
}

Sudoku.prototype.set = function (pos,digit) {
  var new_user_puzzle=this.user_puzzle.substr(0,pos)+digit+this.user_puzzle.substr(pos+1,81-pos-1);
  this.user_puzzle=new_user_puzzle;
  //log('SET #'+this.id+': '+pos+'='+digit);
  broadcast(this);
}

new Sudoku();

///--- CONNECTION-HANDLER ---///
function broadcast(sudoku) {try{wss.clients.forEach((ws) => {
  if (sudoku.id==ws.current_sudoku) {ws.send('['+JSON.stringify(sudoku)+']')}})
} catch(err){};}

wss.on('connection', (ws) => {
  ws.current_sudoku=false;
  ws.on('message', (msg) => {
    var request='';
    try {
      request=JSON.parse(msg);
      var sudoku=sudokus.find(s => s.id == request.id);
      if (sudoku) {
        // save as current_sudoku for this client
        ws.current_sudoku=sudoku.id;
        // set
        request.pos=parseInt(request.pos);
        request.digit=parseInt(request.digit);
        if (!isNaN(request.pos) && !isNaN(request.digit) && (-1>request.pos<81) && (0>request.digit<10)) {
          sudoku.set(request.pos,request.digit)
        } 
        else {
          ws.send('['+JSON.stringify(sudoku)+']');
        }
      }
      // send complete dataset
      else {
        //log('THERE IS NO SUDOKU WITH ID '+request.id+'. SENDING COMPLETE DATASET.');
        ws.send(JSON.stringify(sudokus));
      }
    } catch (e) {
      //log(e);
    }
  });
});

function log(m) {
  console.log(m);
}