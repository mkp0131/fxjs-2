const FxJS = require("fxjs");
const _ = require("fxjs/Strict");
const L = require("fxjs/Lazy");
const C = require("fxjs/Concurrency");

// The module object that exported as default has all the functions in fxjs, including Lazy and Concurrency.
const { reduce, mapL, takeAllC } = FxJS;

// You can also import the functions individually.
const rangeL = require("fxjs/Lazy/rangeL");

// 콘솔로그
const {log} = require("fxjs");

// if 를 대신하여 L.fiter 사용
// 홀수들의 제곱의 합
function f1(limit, list) {
  let acc = 0;
  for (const a of list) {
    if(a % 2) acc = acc + (a * a);
  }
  return acc;
}

function f2(list) {
  let acc = 0;
  for (const a of L.map(a => a * a, L.filter(a => a % 2, list))) {
    acc = acc + a;
  }
  return acc;
}

log(f2([1,2,3,4]))
