module.exports = {generate : generate};
var sudoku_solver = require('./sudoku_solver.js');

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
  if (s.solutions.length==1) {
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
  }
  callback(s.solutions[0]);
}
