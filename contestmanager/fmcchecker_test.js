/**
 * Test of fmcchecker.js and alg.js
 */

var fmcchecker = require('./fmcchecker.js');

/*var scramble = "F' D2 F D2 F2 R2 B' R2 U2 F' D B L' F2 D U2 L B2 F' L";
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
];*/

// 2016後半期第1節のデータ
/*var scramble = "R' U' F U' F2 U2 L2 U' R2 U2 L2 F2 R2 U2 F' L F2 U B2 F2 L2 B' R U' R' U' F"
var solutions = [
"B D' R F' D' B2 D F D' B2 D' U B' R B2 R2 B2 D' L' D' R L2 B2 R' B' R B' L' D'", //0769e749-ee30-493c-9d2c-c4db3fd236b2
"DNF", // 13e86987-36e8-437c-8f21-e4f72582f74b
//"x B L' F' D' B' U2 R' U2 R F U' F' L U' L' B' U2 B2 U2 B' U' R' U R U2 R' U F' U F2 R F' B U' z R U R' U' Fw' y' x' R U' R D2 R' U R D2 R2", // 1784871d-c869-40b8-8b2d-0bbfaf19b2a3
"B D' R U R D' R D2 B2 L B L' D' R' D R' B R B' R' D R D' R F' R' F D R B R' B' D' F R F' R F R2 F' D R2 D' R2 D B' D' R' D R Uw R Uw2 B'", // 234c002c-c874-46d0-bb90-fac2d3e8d970
"U' F2 U' R U'\nL' D2 L\nB' D2 B' D' B\nL' D' F' D F \nR' D2 R L F B D2 F' B\nL' F' U' L", // 296ce3a9-98e2-4b7c-9bad-99b225ca933d
"B D' R U B' R B2 R B2 D F D F' B R' B' D2 R D R' x2 y L' U' B U L U' L' B' L U R' U' R F2 R' U R U F2 U' F2 U' F2", // 2bd04880-aa05-44d6-a868-a81b9a3b6f4e
"D L B U B' U' B2 U F R B' D2 B R' F R B' L' F L B U F U' R' F' R2 F2 R F' R L' U' R' U L F' L F L' F' L' U L2 F' L' F' L F L' U'", // 2c45c991-c438-4a3b-a9af-30d61622db88
"F' R' F R F B' D' F' D B L R2 D R' D' R' D R D' R' F R' F2 R B R B' F R D2 R F2 R' D U B D' U'", // 468fb926-3ca9-4304-ae7a-ef649576ad88
"B D' R U R D2 F' R F D' B2 L B L' B' D' L' D F2 U2 B2 R' B2 U2 F2 B R2 D' R2 D", // 46e28398-e835-494b-8c1b-5f5215450aa4
"B'UF'LDR'BD'\nLR'U2RL'\nU'F'UFU2RUR'\nU'FUF'\nB'U'B\nyF2L2F'R2FL2F'R2\ny'UB'RBR'U'R'F'L'U'LUF", // 47299e06-e453-456f-8dbf-8d74672a9b63
"U B D' U' R U\nR2 B2 U R2 U'\nD R' D R B' D B R'\nL D' R D L' D R2 B R B' D'", // 4a9e209f-8703-4330-aabb-3145b79a25dc
"B D' R U R D2 B' D B D2 R D R' L B' L B2 D' B' D' B D B' L2 D2 B F' R F B2 R2 D' R2 D", // 5a164222-d8e0-4d7a-b3c5-9acfc0106a81
//"x2 R' u' R y2 F2 U' R2 D R U' R' U2 d F' U' F y2 U2 R U R' U d F' U' F y R U R' U2 R U R' U' d' R U R' y2 R' U' R U2 R' U R y' f' L' U' L U f y R' U2 R U2 R' F R U R' U' R' F' R2 U'", // 5a23ee56-215a-4532-ba9b-f26de197ded4  (algエラー)
"x2Uw'B'R'B2D'B'y2U'RU'R'Uw2yRU2R'yD'RUR'DU'yR'U'RU'LU2L'2U'L'2U'L'y'R'U'R'FRF'UR2B'RF2R'BRF2R2U'", // 687fe516-3410-4959-b32d-7b540f439f38
"B D' R U D2 F D' F' D' B'\nD' R' D F' R F D F D2 F'\nD' F D' F' D' F' R F R' F\nL' F R2 F' L F R2 F2 D", // 6b6e72b0-1ebf-44bf-9781-b6adbe823881
"x2 D' R' F R2 D' R' D2 R' U' R U' R' U R2 U2 R' U F' U' F U B' U B U2 L' U' L U' B' U' B U2 B' U B Lw' U' L U' L' U2 Lw F R' F L2 F' R F L2 F2", // 7044a102-1971-44a6-9c99-7fdc081b7af3
"x y2 F D' F' U' R' B' U' B F' U F L' U' L U2 R U R' U R U' R' B U B' y' L F' L' U' L U F U' L' y' x' R2 D2 R' U' R D2 R' U R' F", // 776e8c78-d16a-44c1-899e-70aef21d575e
"x2 z U D' F' R' L F2 B D L' B U' B' D U' L' U L U2 B' U' B U R U R' U' F U' F' U2 R U R' U Rw' R2 U R' U R U2 R' U R' Rw R' U R' U' R' U' R' U R U R2 U2", // 77efb278-223c-4d53-8751-e482cb4da2eb
"DNF", // 79d45b14-6258-4938-8dd8-9670301f9952
//"L2 R' B R2 U B' [f2] R U' R' B' U' B U' B U B' U2 L' U' L U2 L' U' L U' F' U' F [u] Rw' U' R U' R' U R U' R' U2 Rw [u'] R U R' U' R' F R2 U' R' U' R U R' F' U'", // 7ba1d181-0cd9-4b66-8321-fd77abb47dbe
//"Uw2 L F' R' B L' Uw L' U' R' U2 R U B' U' B F' U2 F U2 F' U F U' L' U2 L U L' U' L U2 R' U2 R U' B U' B' u2 Fw R U R' U' Fw' U L' U2 L U L' U L f U R Dw' R2 r Uw' R U' R' U R' Uw R2 U'", // 7e779222-9c30-44c2-a4f3-c7456f2facd7
"U R' D L' D' R D L R2 U' R' D' F R U F' U' F R' U B' R B U L' U R U' L U' L U B R2 D' U'", // 861659c6-422a-4116-8781-2f8575421586
//"2yx'UwLUwB'R'UwR'UwRUL'ULR'UBUB'ULU'L'RU'R'UBU'B'U2RU'R'URUR'yR'wU'RwU'R'URU'R'URR'wURw", // 8b690e48-bcb9-404a-a529-a744734d1169 (algエラー)
"B D' R U x2 U R B U B' R U2 R U2  F' U L' U' L U2 R U' R' U R' F R F' L U L' U L U2 L' y' R U R' F' R U R' U' R' F R2 U' R'  U2", // 8e45f36a-967a-43fc-82ce-b4f8b832ad6e
"B' R' U' B' D' B' F2 R2 B2 D2 B D2 L' R2 F L' B' U' B L F' B D' L D F2 B' U' F' B L2 B' U F' R2", // 8fba624d-d550-4d91-9a60-e06ac36c6cc7
"x2 U L' R' U' R L2 D B' D L D F' D B' D' B D B' R", // 977f7b5a-f648-4d9d-9f94-37ac9fa8a5ad
"B D' R U D2 B' R B2 R2 B2 D' L' D' R D L D B D2 B' R D' L2 D R' D' L D L D", // 995ab7fa-818f-4ff8-849f-b65897c9295c
//"B D' R U R B' R' F' R F2 D F2 R F R' D' L' D' L2 B' L' B [r2] [u']\nFw R U R' U' Fw' [u'] F R U R' U'\nR U' R' U R U R2 F' R U R U' R'", // afe5d84e-0bc5-42c8-9383-8d6bf2e16b13
//"z2 Uw' F R2 Uw' U2 R' Uw2 R U2 R' y U' R' L U' L2 R2 B L U2 R2 U' R U' F' U F U R' U2 R U' R' U R F' Rw U R' U' L' U Lw U' R U' R U R U R U' R' U' R2", // b1680ba5-ebc7-4fca-b16a-e3481fa967cb
"D2 L' U' F2 U2 D' B2 D2 B' L' B2 D L R' B2 L' R D B2 F L B2 L' F2 U' L", // b536c3a2-bfa8-47df-b3c5-e8141bf15682
"D L'R' D' R U F' L B' U2 F' U F2 L F' L' D R D' F' U F2 U' R F' R F R' F' R F U' B U R U' R' B' R U2 F R' F' R' F R F' U' F R F' R' F' U F U'", // c6c66b7c-fe02-4bfc-8f8a-7b4c172c0e5e
"RBUDRB2\nF'R'FR'F'RF\nBRB'RB'R'B\nU'RB'R'BRU\nRDB'D'B\nD'R2DR2D'FDRD'R'D'F'D2R'", // cb2b57c0-b089-4f29-a491-40d82f64f5bb
"DNF", // cbeeceb8-e494-4d52-b8d8-a447f58212b8
"DNF", // d2f7042d-f5f5-4861-883d-9508472d83ae
"y z2 U' F2 R' F' R L2 D y' R U F2 R U' F L F L' y U' L' U' L U' L F' L' y' R2 U R' U R U' R' U R U2 R'", // d4047f45-1055-45d0-89e6-c5f8ecb3c81f
"B D' R U R B' R' F' R F2 D F2 R F R' [r2] F U' F' L' U2 L U' L' B' U B L F' L F R' F' L' F R U2", // d7594900-9816-435d-86f7-071234bed0df
"L B F' R' F D' B U2 B U B' U2 B U L' U' L B U2 B' U R U' R' U R U R' U' R U' R' B' U2 B U B' U B U'", // d83ef9b6-81c7-4777-9c87-eb1546b54d9c
"DNF", // dc91ecf4-1810-4f63-a06c-c9f43462019b
"F' R' U' F D' B R U' B U2 R' B2 U' B U B R' B' R B' R' B R D' R D F2 L F' R2 F L' F' R2 F'", // e6e25ffd-4b71-4462-8127-f984121ee78c
"F2 R2 F R F R F L F' R F L' R2 F2 L2 D2 L' D F2 U F' U B D' B' U' B F' U'", // eda6d0ce-e7ee-481d-a84a-e2d3ecbfc7fe
"DNF", // f7625320-01e9-444c-bc59-57f10cdd62a8
"R F F' U2 F' R F R D R' F D F' L' D L D B D B2 D2 B D F' D' F D B' D B D B' D B D' B' D B", // fd64e376-2e05-4c29-9638-f2dab2b2351f
"R U2 F' U F R' D' R D' R' D R U2 F D2 F' L D2 L' R D' R' D2 L' D L B D2 B' L D' L' D2 L D L' z2 Fw R U R' U' Fw' L' U2 L U L' U L U2 R U R' U' R' F R2 U' R' U' R U R' F' y' R U' R U R U R U' R' U' R2" // ffb82e98-34b0-4fa0-afed-9da92c5041fc
];*/

// 2016前半期第1期のチェック時点でプログラム落ちたやつ
var scramble = "R' U' F U' F2 U2 L2 U' R2 U2 L2 F2 R2 U2 F' L F2 U B2 F2 L2 B' R U' R' U' F"
var solutions = [
"x B L' F' D' B' U2 R' U2 R F U' F' L U' L' B' U2 B2 U2 B' U' R' U R U2 R' U F' U F2 R F' B U' z R U R' U' Fw' y' x' R U' R D2 R' U R D2 R2", // 1784871d-c869-40b8-8b2d-0bbfaf19b2a3
"x2 R' u' R y2 F2 U' R2 D R U' R' U2 d F' U' F y2 U2 R U R' U d F' U' F y R U R' U2 R U R' U' d' R U R' y2 R' U' R U2 R' U R y' f' L' U' L U f y R' U2 R U2 R' F R U R' U' R' F' R2 U'", // 5a23ee56-215a-4532-ba9b-f26de197ded4  (algエラー)
"L2 R' B R2 U B' [f2] R U' R' B' U' B U' B U B' U2 L' U' L U2 L' U' L U' F' U' F [u] Rw' U' R U' R' U R U' R' U2 Rw [u'] R U R' U' R' F R2 U' R' U' R U R' F' U'", // 7ba1d181-0cd9-4b66-8321-fd77abb47dbe
"Uw2 L F' R' B L' Uw L' U' R' U2 R U B' U' B F' U2 F U2 F' U F U' L' U2 L U L' U' L U2 R' U2 R U' B U' B' u2 Fw R U R' U' Fw' U L' U2 L U L' U L f U R Dw' R2 r Uw' R U' R' U R' Uw R2 U'", // 7e779222-9c30-44c2-a4f3-c7456f2facd7
"2yx'UwLUwB'R'UwR'UwRUL'ULR'UBUB'ULU'L'RU'R'UBU'B'U2RU'R'URUR'yR'wU'RwU'R'URU'R'URR'wURw", // 8b690e48-bcb9-404a-a529-a744734d1169 (algエラー)
"B D' R U R B' R' F' R F2 D F2 R F R' D' L' D' L2 B' L' B [r2] [u']\nFw R U R' U' Fw' [u'] F R U R' U'\nR U' R' U R U R2 F' R U R U' R'", // afe5d84e-0bc5-42c8-9383-8d6bf2e16b13
"z2 Uw' F R2 Uw' U2 R' Uw2 R U2 R' y U' R' L U' L2 R2 B L U2 R2 U' R U' F' U F U R' U2 R U' R' U R F' Rw U R' U' L' U Lw U' R U' R U R U R U' R' U' R2" // b1680ba5-ebc7-4fca-b16a-e3481fa967cb
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
