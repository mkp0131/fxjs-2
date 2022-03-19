const FxJS = require("fxjs");
const _ = require("fxjs/Strict");
const L = require("fxjs/Lazy");
const C = require("fxjs/Concurrency");

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
      if (limit === 0) break;
    }
  }
  return acc;
}

// go, filter, map, talk, reduce 를 활용하여 기존의 명령형 코드를 선언형 코드로 변경
const add = (a, b) => a + b;
function f2(limit, list) {
  return _.go(
    list,
    _.filter(a => a % 2),
    _.map(a => a * a),
    _.take(limit),
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
  return [..._.range(1, end, 2)];
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
  { id: 1, user: 'mkp', age: 34},
  { id: 20, user: 'kan', age: 10},
  { id: 3, user: 'ldk', age: 22},
  { id: 40, user: 'mandu', age: 14},
  { id: 5, user: 'chang', age: 18},
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

// map 으로 합성하기
const f = x => x + 10;
const g = x => x - 5;

// fg 함수에 파라미터가 들어오지 않을 경우 NaN 에러가 난다.
const fg = x => f(g(x));

// map 을 활용하여 안전하게 합성 할 수 있다.
// _.go(
//   [10],
//   _.map(fg),
//   _.each(log)
// )

// find 를 대신 filter 사용
// const findUser = _.find(user => user.user === 'mkp', users);
// if(findUser) log(findUser); // findUser 에 값이 있을 경우 실행

// filter 를 활용하여 재합성
const findUser2 = _.pipe(
  _.filter(user => user.age > 10),
  _.take(1),
  _.each(log)
)

// 객체를 이터러블 프로그래밍으로 다루기
// 1. values
// Object.values 를 지연성으로 구현
const lazyObjValues = function *(obj) {
  for (const k in obj) {
    yield k;
  }
}

const lazyObjEntries = function *(obj) {
  for (const k in obj) {
    yield [k, obj[k]];
  }
}

const lazyObjKey = function *(obj) {
  for (const k in obj) {
    yield k;
  }
}

// _.go(
//   users,
//   lazyObjValues, // 지연적으로 평가
//   _.map(a => a + ' Good!'),
//   _.take(2), // 지연적으로 평가하기 때문에 2개의 값만 평가한다.
//   _.each(log)
// )

// object
// [['a', 1], ['b', 2], ['c', 3]] 형태를 {a: 1, b: 2, c: 3} 형태로 생성
const object = (entries) => _.go(
  entries,
  _.map(([k, v]) => ({[k]: v})),
  _.reduce(Object.assign)
)

// reduce 하나만으로 표현
const object2 = (entries) => _.reduce((obj, [k, v]) => (obj[k] = v, obj), {}, entries)

// mapObject 오브젝트를 순회하면 값 평가
const mapObject = (f, obj) => _.go(
  obj,
  lazyObjEntries,
  _.map(([k, v]) => [k, f(v)]),
  object2
)

// pick, 오브젝트에서 원하는 값만 추출해서 새로운 오브젝트 생성
const pick = (keys, obj) => _.go(
  keys,
  _.map((k) => [k, obj[k]]),
  _.reject(([_, v]) => v === undefined),
  object2
)

// indexBy

// - 배열을 index 를 가진 object 로 변경
// - 한바퀴를 순회하고나면 데이터를 더욱 빠르게 key로 찾을 수 있다.

// indexBy 된 것을 filter 하기
const users2 = _.indexBy(user => user.id, users);
const indexByFilter = (f, obj) =>  _.go(
  obj,
  lazyObjEntries,
  _.filter(([_, a]) => f(a)),
  object2,
)


log(indexByFilter(user => user.age > 20, users2));

