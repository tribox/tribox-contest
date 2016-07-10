/**
 * tofixedforpriority_test.js
 *
 * toFixedForPriority() 関数のテスト。
 */

// app/views/contestjs.scala.html のコピー
var toFixedForPriority = function(n) {
    nstr = String(n);
    if (nstr.indexOf('.') != -1) {
        var p0 = nstr.split('.')[0];
        var p1 = nstr.split('.')[1];
        return ('000' + p0).slice(-3) + (p1 + '000').slice(0, 3);
    } else {
        return ('000' + nstr).slice(-3) + '000';
    }
};

console.log(toFixedForPriority(0.0));
console.log(toFixedForPriority('0.0'));
console.log(toFixedForPriority(0.1));
console.log(toFixedForPriority('0.1'));
console.log(toFixedForPriority(0.02));
console.log(toFixedForPriority(0.003));
console.log(toFixedForPriority(0.0004));
console.log(toFixedForPriority(5.1));
console.log(toFixedForPriority(5.02));
console.log(toFixedForPriority(5.003));
console.log(toFixedForPriority(10.009));
