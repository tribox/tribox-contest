/**
 * nanoid を試してみる
 */

var nanoid = require('nanoid');
var nanoidCustom = nanoid.customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 21);

var str1 = nanoid.nanoid();
var str2 = nanoidCustom();
var str3 = nanoidCustom();

console.log(str1);
console.log(str2);
console.log(str3);
