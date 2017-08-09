module.exports = {generate : generate};
var sudoku_solver = require('./sudoku_solver.js');
//console.oldLog = console.log; var consolelog=''; console.log = function(value) {console.oldLog(value); consolelog+=value+'\n';};

function generate() {
  var result=[];
  generate_random_sudoku(
    (s)=>generate_puzzle_base(s,
      (s,p)=>reduce_puzzle(s,p,
        (s,p)=>{result.push(p,s)}
      )
    )
  );
  return result;
}

function save_puzzle(sudoku,puzzle) {
  sudokus.push([puzzle,sudoku]);
  var bar='';
  var bar_width=25;
  var progress=Math.floor(i/number_of_sudokus*bar_width);
  for (var b = 1; b <= progress; b++) {bar+='\u2588'}
  for (var b = 1; b <= bar_width-progress; b++) {bar+='\u2591'}
  console.log('\033[1AGENERATED SUDOKUS: '+bar+' '+i+'/'+number_of_sudokus);
}

function reduce_puzzle(sudoku,puzzle,callback) {
  // remove any of the hints (in random order) if it solves without it
  var hintpos=[];
  for (var i=0; i<puzzle.length; i++) {if (puzzle[i]!='-') {hintpos.push(i)}}
  hintpos=shuffle_list(hintpos);
  var pos=hintpos.pop();
  while (pos) {
    var new_puzzle=puzzle.substr(0,pos)+'-'+puzzle.substr(pos+1,puzzle.length-pos-1);
    var s=sudoku_solver.solve(new_puzzle);
    if (s.solutions.length==1) {
      //console.log(new_puzzle); 
      puzzle=new_puzzle
    };
    pos=hintpos.pop();
  }
  callback(sudoku,puzzle);
}

function generate_puzzle_base(sudoku,callback,hints,tries,current_try) {
  // only pick sudoku-numbers from n random positions (all others are "-")
  var puzzle='', mask=[];
  if ((!hints)||(hints<17)) {hints=32};
  if (!current_try) {current_try=1};
  if (!tries) {tries=5};
  // create a list of numbers 0 to 80
  for (var i=0; i<81; i++) {mask.push(i)};
  // take only the first n numbers of shuffled_numbers
  mask=shuffle_list(mask).slice(0,hints);
  for (var i=0; i<81; i++) {
    // if i is within the mask, add the number from the sudoku to the puzzle, else add "-"
    if (mask.indexOf(i)>=0) {puzzle+=sudoku[i]} else {puzzle+='-'}
  };
  // solve the sudoku
  var s=sudoku_solver.solve(puzzle);
  //console.log(puzzle+' ('+hints+' hints #'+current_try+' '+(s.stats.end-s.stats.start)+'ms)   ');
  //console.log('\033[2A');
  if (s.solutions.length==1) {
    //console.log();
    return callback(sudoku,puzzle);
  } else {
    if (current_try>=tries) {++hints, current_try=0}
    generate_puzzle_base(sudoku,callback,hints,tries,++current_try);
  }
}

function shuffle_list(list) {
  for (var i=0; i<list.length; i++) {
  	// change each position with another random position
  	var x=list[i];
  	var r=Math.floor(Math.random()*list.length);
  	list[i]=list[r];
  	list[r]=x;
  };
  return list;
}

function generate_random_sudoku(callback) {
  var s={solutions:[]}, i=0;
  while ((i<25)&&(!s.solutions.length)) {
    i++;
    s=sudoku_solver.solve();
    //console.log(s.solutions[0]+' ('+s.stats.runs+' runs)');
  }
  //console.log(print_2d(s.solutions[0]));
  callback(s.solutions[0]);
}

function print_2d(puzzle) {
  var res = '';
  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      res += [""," "," ","  "," "," ","  "," "," "][col];
      res += puzzle[row*9+col];
    }
    res += ['\n','\n','\n\n','\n','\n','\n\n','\n','\n','\n'][row];
  }
  return res;
}
