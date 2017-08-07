module.exports = {solve : solve};
var maxruns=1500;
function log(message) {if (1) {console.log('LOG '+message)}};
function debug(message) {if (0) {console.log('DEBUG '+message)}};

function solve(puzzle) {
  var data={puzzle:puzzle, options:[], solutions:[], errors:[], stats:{dig:0, runs:0, crunch_numbers:0, crunch_groups:0, start:Date.now()}};
  return solve_recursive(data);
}

function solve_recursive(data) {
  data.stats.runs++;
  for (var pos=0; pos<81; pos++) {data.options.push([1,2,3,4,5,6,7,8,9])};
  return recursively_select_position_and_try_its_options(
           set_all_candidates_that_only_occur_once_in_a_group(
             parse_puzzle(data)
           )
         );
}

var groups=[];
// create a group for each row and column
for (var x=0; x<9; x++) {var gx=[],gy=[]; for (var y=0; y<9; y++) {gx.push(x+y*9);gy.push(x*9+y);} groups.push(gx);groups.push(gy);}
// create a group for each square
[0,3,6,27,30,33,54,57,60].forEach((i)=>{groups.push([i,i+1,i+2,i+9,i+10,i+11,i+18,i+19,i+20])})

var dependencies=[];
// create a map of all dependencies (if position X is set, all positions in dependencies[X] are affected)
for (var pos=0; pos<81; pos++) {
  var d=[];
  groups.forEach((g)=>{if (g.indexOf(pos)>=0) {d=d.concat(g)}}) // concat all groups you are member of
  d=d.filter((value, index, self)=>{return self.indexOf(value) === index}) // be distinct
  d.splice(d.indexOf(pos),1) // do not depend on yourself
  dependencies.push(d);
}

function parse_puzzle(data) {
  // parse puzzle-string and call set for each known position
  for (var pos=0; pos<data.puzzle.length; pos++) {
    if ([1,2,3,4,5,6,7,8,9].indexOf(parseInt(data.puzzle[pos]))>=0) {
      set(data,pos,parseInt(data.puzzle[pos]));
    }
  };
  return data;
}

function set(data,pos,candidate) {
  data.stats.crunch_numbers++;
  // set candidate as only option at this position
  data.options[pos]=[candidate];
  // remove candidate from options in all dependencies
  dependencies[pos].forEach((dep_pos)=>{
    var candidate_index=data.options[dep_pos].indexOf(candidate);
    if (candidate_index>=0) {
      if (data.options[dep_pos].length==1) {
        // there would be no option left after removing candidate / the candidate is already fixed at this position > the puzzle does not solve
        var error='Conflict with candidate '+candidate+' at positions '+dep_pos+' and '+pos+'. This is not a valid puzzle.';
        data.errors.push(error);
        debug(error);
      } else {
        // remove candidate from options
        data.options[dep_pos].splice(candidate_index,1);
        // if there is only one option left after removing > call set
        if (data.options[dep_pos].length==1) {
          debug(data.options[dep_pos][0]+' is the only candidate left at position '+dep_pos+'.');
          set(data,dep_pos,data.options[dep_pos][0]);
        }
      }
    }
  })
}

function set_all_candidates_that_only_occur_once_in_a_group(data) {
  var success=true;
  while ((success)) {
    data.stats.crunch_groups++;
    success=false;
    groups.forEach((group)=>{
      [1,2,3,4,5,6,7,8,9].forEach((candidate)=>{
      var position=-1;
      group.forEach((pos)=>{
        if ((data.options[pos].length>1)&&(data.options[pos].indexOf(candidate)>-1)) {
          if (position==-1) {position=pos} else {position=-2}
        }
      })
      if (position>=0) {
        debug(candidate+' can only be at position '+position+' in group '+group+'.')
        set(data,position,candidate);
        success=true;
      }
      })
    })
  }
  return data;
}

function recursively_select_position_and_try_its_options(data) {
  // if solved, save solution
  if ((!data.errors.length) && (data.options.every((o)=>{return o.length==1})))
  {
    log('solved: '+generate_puzzle_from_options(data.options));
    data.solutions.push(generate_puzzle_from_options(data.options));
    data.stats.dig_needed=data.stats.dig;
    data.stats.runs_needed=data.stats.runs;
  }

  // create puzzle-strings for all options of one (random) position
  var current_puzzle=generate_puzzle_from_options(data.options);
  var puzzles_to_check=[];
  var counter=0;

  var positions_with_options=[];
  for (var pos = 0; pos < data.options.length; pos++) {if (data.options[pos].length>1) {positions_with_options.push(pos)}}
  if (positions_with_options.length) {
    var pos=positions_with_options[Math.floor(Math.random()*positions_with_options.length)];
    log('Trying position '+pos+' with options '+data.options[pos]+'.');
    data.options[pos].forEach((guess)=>{
      counter++;
      var new_puzzle=current_puzzle.substr(0,pos)+guess+current_puzzle.substr(pos+1,current_puzzle.length-pos-1);
      puzzles_to_check.push({puzzle:new_puzzle, id:counter});
    })
  }
  
  // solve puzzle-strings until all possibilities are checked...
  //if ((puzzles_to_check.length)&&(data.stats.runs<=maxruns)&&(data.solutions.length<=1)) {
  if (puzzles_to_check.length) {
    log(data.stats.dig+' [ '+puzzles_to_check.length+' ] '+current_puzzle);
    for (var i = 0; i < puzzles_to_check.length; i++) {
      // ...or timeout (maxruns) or more than one solution found
      if ((data.stats.runs<=maxruns)&&(data.solutions.length<=1))
      {
        log(data.stats.dig+' ['+puzzles_to_check[i].id+'/'+puzzles_to_check.length+'] '+puzzles_to_check[i].puzzle);
        data.stats.dig++;
        solve_recursive({puzzle:puzzles_to_check[i].puzzle, options:[], solutions:data.solutions, errors:[], stats:data.stats});
        data.stats.dig--;
      } else {
        i=puzzles_to_check.length;
        if (data.stats.runs>maxruns) {data.errors.push('EXCEED-ERROR. Tried for a long time now. (maxruns='+maxruns+') Aborted without solution.')}
        if (data.solutions.length>1) {data.errors.push('NOT-A-VALID-SUDOKU-ERROR. Found more than one solution. (found '+data.solutions.length+' and aborted)')}
      }
    }
  }
  
  data.stats.end=Date.now();
  return data;
}

function generate_puzzle_from_options(options) {
  var puzzle='';
  options.forEach((o)=>{if (o.length==1){puzzle+=o[0]} else {puzzle+='-'}});
  return puzzle;
}
