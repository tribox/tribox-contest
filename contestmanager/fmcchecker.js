/**
 * fmcchecker.js
 */

var exec = require('child_process').exec;

var alg = require('alg');
var metric = { metric: "obtm" };

var Config = require('./config.js');

// replaceAlg: 置換処理
//   * 改行             -> 空文字列
//   * "’"             -> "'"
//   * " "              -> 空文字列
//   * "[u]"            -> "y" etc.
//   * 使用されない文字 -> 空文字列
var replaceAlg = function(str) {
    str = str.replace(/\\n/g, '').replace(/\\r/g, '');
    str = str.replace(/ /g, '');
    str = str.replace(/’/g, "'");
    str = str.replace(/\[r\]/g, "x").replace(/\[r'\]/g, "x'").replace(/\[r2\]/g, "x2")
             .replace(/\[l\]/g, "x'").replace(/\[l'\]/g, "x").replace(/\[l2\]/g, "x2")
             .replace(/\[u\]/g, "y").replace(/\[u'\]/g, "y'").replace(/\[u2\]/g, "y2")
             .replace(/\[d\]/g, "y'").replace(/\[d'\]/g, "y").replace(/\[d2\]/g, "y2")
             .replace(/\[f\]/g, "z").replace(/\[f'\]/g, "z'").replace(/\[f2\]/g, "z2")
             .replace(/\[b\]/g, "z'").replace(/\[b'\]/g, "z").replace(/\[b2\]/g, "z2");
    str = str.replace(/[^FBRLUDxyz'2w]/g, '');
    return str;
};

// convAlg: 手順変換
//   Sarumawashi 用に回転操作を含まない手順に変換する
var convAlg = function(str) {
    // まず、簡単にするために、
    // 2層回し表現を1文字にするために小文字にして、
    // 反時計回りと180度回転を90度回転に変換する
    str = str.replace(/'2/g, '2').replace(/2'/g, '2');
    str = str.replace(/'w/g, "w'");
    str = str.replace(/Rw/g, 'r').replace(/Lw/g, 'l')
             .replace(/Uw/g, 'u').replace(/Dw/g, 'd')
             .replace(/Fw/g, 'f').replace(/Bw/g, 'b');
    str = str.replace(/R'/g, 'R R R').replace(/r'/, 'r r r')
             .replace(/L'/g, 'L L L').replace(/l'/, 'l l l')
             .replace(/U'/g, 'U U U').replace(/u'/, 'u u u')
             .replace(/D'/g, 'D D D').replace(/d'/, 'd d d')
             .replace(/F'/g, 'F F F').replace(/f'/, 'f f f')
             .replace(/B'/g, 'B B B').replace(/b'/, 'b b b');
    str = str.replace(/R2/g, 'R R').replace(/r2/g, 'r r')
             .replace(/L2/g, 'L L').replace(/l2/g, 'l l')
             .replace(/U2/g, 'U U').replace(/u2/g, 'u u')
             .replace(/D2/g, 'D D').replace(/d2/g, 'd d')
             .replace(/F2/g, 'F F').replace(/f2/g, 'f f')
             .replace(/B2/g, 'B B').replace(/b2/g, 'b b');
    str = str.replace(/x'/g, 'x x x').replace(/x2/g, 'x x')
             .replace(/y'/g, 'y y y').replace(/y2/g, 'y y')
             .replace(/z'/g, 'z z z').replace(/z2/g, 'z z');

    // 2層回しを全体回転と1層回しに置き換える
    str = str.replace(/r/g, 'L x')
             .replace(/l/g, 'R x x x')
             .replace(/u/g, 'D y')
             .replace(/d/g, 'U y y y')
             .replace(/f/g, 'B z')
             .replace(/b/g, 'F z z z');

    // これで手順には以下の文字のみ使用されるように変換できた
    //   R, L, U, D, F, B, x, y ,z

    // 末尾の全体回転は削除する
    while(str.slice(-2) == ' x' || str.slice(-2) == ' y' || str.slice(-2) == ' z') {
        str = str.slice(0, -2);
    }

    // 回転が無くなったら、以降のmoveがどう変換されるか辞書
    var rotMap = {
        'x': {'R': 'R', 'L': 'L', 'U': 'F', 'D': 'B', 'F': 'D', 'B': 'U', 'x': 'x', 'y': 'z', 'z': 'y y y'},
        'y': {'R': 'B', 'L': 'F', 'U': 'U', 'D': 'D', 'F': 'R', 'B': 'L', 'x': 'z z z', 'y': 'y', 'z': 'x'},
        'z': {'R': 'U', 'L': 'D', 'U': 'L', 'D': 'R', 'F': 'F', 'B': 'B', 'x': 'y', 'y': 'x x x', 'z': 'z'}
    };

    // 全体回転がなくなるまで繰り返す
    while(str.indexOf('x') != -1 || str.indexOf('y') != -1 || str.indexOf('z') != -1) {
        var arr = str.split(' ');
        var found = '';
        for (var i = 0; i < arr.length; i++) {
            if (found == '') {
                if (arr[i] == 'x' || arr[i] == 'y' || arr[i] == 'z') {
                    found = arr[i];
                    arr[i] = '';
                    continue;
                }
            }
            if (found != '') {
                // 上の規則にしたがって置換する
                arr[i] = rotMap[found][arr[i]];
            }
        }
        str = arr.join(' ');
    }

    return str;
};

exports.checkSolution = function(scramble, solution, callback) {
    var replaced =  replaceAlg(solution);

    // 置換後の手順文字列が空文字列ならDNF
    if (replaced.length <= 0) {
        callback(-1);
        return;
    }

    // OBTM での手数
    var moves = alg.cube.countMoves(replaced, metric);
    //console.log('moves: ', moves);

    // 手数が10手未満は明らかにおかしい
    if (moves < 10) {
        callback(-1);
        return;
    }

    // invert を2回適用して記号の区切りにスペースを入れる
    var withSpace = alg.cube.invert(alg.cube.invert(replaced));
    //console.log('withSpace: ', withSpace);

    // 回転を含まない手順に変換する
    var conved = convAlg(withSpace);
    //console.log('conved: ', conved);

    exec(Config.PATH_TO_SARUMAWASHI + '/sample/check_solved "' + scramble + ' ' + conved + '"', function(error, stdout, stderr) {
        if (stdout) {
            //console.log('stdout: ' + stdout);
            if (stdout.charAt(0) == '1') {
                callback(moves);
            } else {
                callback(-1);
            }
        }
        if (stderr) {
            console.error('stderr: ' + stderr);
        }
        if (error != null) {
            console.error('Exec error: ' + error);
        }
    });
};
