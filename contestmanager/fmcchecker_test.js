/**
 * Test of fmcchecker.js and alg.js
 */

var fmcchecker = require('./fmcchecker.js');

var scramble = "F' D2 F D2 F2 R2 B' R2 U2 F' D B L' F2 D U2 L B2 F' L";
var solutions = [
    "B2 L D2 R U R D' B L2 B D2 L D' L' D L D L D2 F D' B' D F' D' L B F'",
    "B2 L D2 R U R D’ B L2 B D2 L D’ L’ D L D L D2 F D’ B’ D F’ D’ L B F’",
    "B2LD2RURD'BL2BD2LD'L'DLDLD2FD'B'DF'D'LBF'",
    "B2LD2RURD'BL2BD2LD'L'DLDLD2FD'B'DF'D'LBF'FFFF",
    "B2LD2RURD'BL2BD2LD'L'DLDLD2FD'B'DF'D'LBF'FFFFxyz",
    "xxxxB2LD2RURD'BL2BD2LD'L'DLDLD2FD'B'DF'D'LBF'FFFFxyz",
    "UwD'y'B2LD2RURD'BL2BD2LD'L'DLDLD2FD'B'DF'D'LBF'FFFFxyz",
    "UwD'[u']B2LD2RURD'BL2BD2LD'L'DLDLD2FD'B'DF'D'LBF'FFFFxyz     あかさたな\n\n",
    "DNF",
    "DNF\n\n\n\n",
    "関係ない文字だけ",
    "x",
    "逆スクランブル L' F B2 L' U2 D' F2 L B' D' F U2 R2 B R2 F2 D2 F' D2 F"
];

//var alg = require('alg');
//var metric = { metric: "obtm" };
//console.log(alg.cube.fromString(scramble));
//console.log(alg.cube.countMoves(scramble, metric));

solutions.forEach(function(solution, index) {
    fmcchecker.checkSolution(scramble, solution, function(moves) {
        console.log(solution + ' --> ' + moves);
    });
});
