module.exports = {generate : generate, generate_with_masks : generate_with_masks};
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

function generate_with_masks(masks) {
  var alt_result=generate();
  var result=[];
  var c=0;

  while ((!result.length)&&(c<64)) {
  c++;
  // generate random sudoku
  generate_random_sudoku((sudoku)=>{
      // apply mask on sudoku
    if (!masks) {
      masks=[
        [0,4,8,12,14,20,21,23,24,28,29,33,34,36,44,46,47,51,52,56,57,59,60,66,68,72,76,80],
        [3,5,11,13,15,19,25,27,30,32,35,37,43,45,48,50,53,55,61,65,67,69,75,77],
        [2,3,5,6,12,14,18,26,27,28,34,35,45,46,52,53,54,62,66,68,74,75,77,78],
        [0,8,11,12,13,14,15,19,25,28,30,32,34,37,43,46,48,50,52,55,61,65,66,67,68,69,72,80],
        [2,6,10,12,14,16,18,21,23,26,28,29,33,34,46,47,51,52,54,57,59,62,64,66,68,70,74,78],
        [0,8,11,13,15,19,21,23,25,29,31,33,37,39,41,43,47,49,51,55,57,59,61,65,67,69,72,80]
      ];
        // create a list of numbers 0 to 80 and take only the first n numbers of shuffled_numbers
        // var m=[]; for (var i=0; i<81; i++) {m.push(i)}; masks.push(shuffle_list(m).slice(0,42));
    }
      masks.forEach((m)=>{
      var puzzle='';
      for (var i=0; i<81; i++) {if (m.indexOf(i)>=0) {puzzle+=sudoku[i]} else {puzzle+='-'}};
      //console.log((c++)+' '+puzzle);
    // try solving the puzzle
    if (sudoku_solver.solve(puzzle).solutions.length==1) {
        //console.log('RESULT: '+result);
      result.push(puzzle,sudoku);
      }
      });
  });
  }
  
  if (!result.length) {result=alt_result}
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
