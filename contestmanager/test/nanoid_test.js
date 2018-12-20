/**
 * nanoid を試してみる
 */

var nanoid = require('nanoid');
var generate = require('nanoid/generate');

var str1 = nanoid();
var str2 = generate('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 21);
var str3 = generate('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 21);

console.log(str1);
console.log(str2);
console.log(str3);
