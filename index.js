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

const numList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 홀수들의 제곱의 합
function f1(limit, list) {
  let acc = 0;
  for (const a of list) {
    if(a % 2) {
      acc = acc + (a * a);
      limit = limit - 1;
      if (limit == 0) break;
    }
  }
  return acc;
}

// go, filter, map, talk, reduce 를 활용하여 기존의 명령형 코드를 선언형 코드로 변경
const add = (a, b) => a + b;
function f2(limit, list) {
  return _.go(
    list,
    filter(a => a % 2),
    map(a => a * a),
    take(limit),
    _.reduce(add)
  )
}

// while -> range
// 범위안의 홀수만 뽑기
function f3(end) {
  let i = 1;
  let result = [];
  while (i < end) {
    result.push(i);
    i = i + 2;
  }
  return result;
}

// range 로 변경
function f4(end) {
  return [...range(1, end, 2)];
}


// 별찍기
const strJoin = (sep = '') => _.reduce((acc, a) => `${acc}${sep}${a}`);

// _.go(
//   L.range(1, 6),
//   L.map(L.range),
//   L.map(L.map( a => '*' )),
//   L.map(strJoin()),
//   strJoin('\n'),
//   log
// )

// 구구단
// _.go(
//   _.range(2, 10),
//   _.map(a => _.go(
//     _.range(1, 10),
//     _.map(b => `${a} X ${b} = ${a * b}`),
//     strJoin('\n'),
//   )),
//   strJoin('\n\n'),
//   log
// )

const users = [
  { user: 'mkp', age: 34},
  { user: 'kan', age: 10},
  { user: 'ldk', age: 22},
  { user: 'mandu', age: 14},
  { user: 'chang', age: 18},
];

// 20대 이상 나이 합산
const getAge = user => user.age;
const limitAge = age => age >= 20;
// _.go(
//   users,
//   _.map(getAge),
//   _.filter(limitAge),
//   _.reduce(add),
//   log
// )

// query, queryToObject (오브젝트를 쿼리스트링 형식으로 만들기)
// 결과값: a=1&c=CC&d=DD
const obj1 = {
  a: 1,
  b: undefined,
  c: 'CC',
  d: 'DD'
}

// 명령형 코드
function query1(obj) {
  let url = '';
  for (const k in obj) {
    if(obj[k]) {
      if(url) url = url + '&';
      url = url + `${k}=${obj[k]}`
    }
  }
  return url;
}

// ES6
function query2(obj) {
  return Object.entries(obj)
    .filter(([k, v]) => v !== undefined)
    .map(a => reduce((k, v) => `${k}=${v}`, a))
    .reduce((acc, a) => `${acc}&${a}`)
}

// fxjs
function query3(obj) {
  return _.go(
    obj,
    Object.entries,
    _.reject(([k, v]) => v === undefined),
    _.map(strJoin('=')),
    strJoin('&')
  )
}

// queryToObject
// ES6
function queryToObject1(query) {
  return query
    .split('&')
    .map(a => a.split('='))
    .map(([k, v]) => ({ [k]: v }))
    .reduce((a, b) => Object.assign(a, b))
}

const strSplit = _.curry((seq, str) => str.split(seq));
const queryToObject2 = _.pipe(
  strSplit('&'),
  _.map(strSplit('=')),
  _.map(([k, v]) => ({ [k]: v })),
  _.reduce(Object.assign)
);

console.log(queryToObject1('a=1&c=CC&d=DD'))

