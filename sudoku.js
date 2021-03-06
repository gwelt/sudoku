#!/usr/bin/env node
var sudoku_solver = require('./sudoku_solver.js');
var sudoku_generator = require('./sudoku_generator.js');
//sudoku_solver.solve('--------25---4---------369---8-5---9-32--97---1--8-3----16---3----5-----82-9-----',(res)=>{console.log(JSON.stringify(res.solutions[0]))})
//console.oldLog = console.log; var consolelog=''; console.log = function(value) {console.oldLog(value); consolelog+=value+'\n';};

var sudokus=[];
var number_of_sudokus=process.argv[2]*1;
if (20000>=number_of_sudokus<=0) {number_of_sudokus=1}
if (process.argv[2]&&(process.argv[2].length==81)) {
  number_of_sudokus=0;
  var s=sudoku_solver.solve(process.argv[2]);
  if (s.solutions[0]) {
    var hints=s.puzzle.split('').map((c)=>{return c=='-'?0:1}).reduce((l,r)=>{return l+r},0);
    console.log('\nPUZZLE:\n'+print_2d(s.puzzle)+'\n\nSOLUTION:\n'+print_2d(s.solutions[0])+'\nRATING: '+s.stats.dig_needed+'.'+hints+'\n');
  }
  else {console.log(s.errors)}
}

for (var i = 1; i <= number_of_sudokus; i++) {
  update_progress_bar('GENERATING: ',i,number_of_sudokus);
  var p=sudoku_generator.generate();
  var s=sudoku_solver.solve(p[0]);
  var hints=s.puzzle.split('').map((c)=>{return c=='-'?0:1}).reduce((l,r)=>{return l+r},0);
  var rating=s.stats.dig_needed+'.'+hints;
  var time=(s.stats.end-s.stats.start)+'ms';
  sudokus.push({puzzle:s.puzzle, solution:s.solutions[0], time:time, rating:rating});
  update_progress_bar('GENERATING: ',i,number_of_sudokus);
}

if (number_of_sudokus==1) {
  console.log('\nPUZZLE:\n'+print_2d(sudokus[0].puzzle)+'\n\nSOLUTION:\n'+print_2d(sudokus[0].solution)+'\nRATING: '+sudokus[0].rating+'\n');
}
else if (number_of_sudokus>1) {
  var text='';
  sudokus.forEach((s)=>{text+=s.puzzle+' '+s.rating+' '+s.time+'\n'})
  var fs = require('fs'); fs.appendFile("sudokus.txt", text, function(err) {if(err) {return console.log(err);} console.log("Sudokus saved in sudokus.txt");}); 
  //var fs = require('fs'); fs.writeFile("sudokus.json", JSON.stringify(sudokus), function(err) {if(err) {return console.log(err);} console.log("Sudokus saved in sudokus.json");}); 
} 

var start_time=false;
function update_progress_bar(text,current,max) {
  if ((current>1)||(max>1)) {
    if (!start_time) {console.log();start_time=Date.now()}
    var bar_width=50;
    var progress=Math.floor(current/max*bar_width);
    var bar='';
    for (var b = 1; b <= progress; b++) {bar+='\u2588'}
    for (var b = 1; b <= bar_width-progress; b++) {bar+='\u2591'}
    var time=((Date.now()-start_time)/1000).toFixed(3);
    var display_time=time+'s';
    if (time>0) {display_time=seconds_to_min_sec(time)}
    var per_minute=Math.floor(60*current/time);
    var time_estimated=seconds_to_min_sec(max*time/current);
    console.log('\033[1A'+text+bar+' '+current+'/'+max+' '+per_minute+'/min '+display_time+'/'+time_estimated+'      ');
  }
}
function seconds_to_min_sec (s) {
  if (s>0)
  {
    var min=Math.floor(s/60);
    var sec=Math.floor(s%60); if (sec<10) {sec='0'+sec};
    return min+':'+sec;
  } else {return '%'}
}

function print_2d(puzzle) {
  var res = '';
  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      res += [""," "," ","  "," "," ","  "," "," "][col];
      if (['1','2','3','4','5','6','7','8','9'].indexOf(puzzle[row*9+col])>=0) {res += puzzle[row*9+col]} else {res+= '_'}
    }
    res += ['\n','\n','\n\n','\n','\n','\n\n','\n','\n','\n'][row];
  }
  return res;
}
