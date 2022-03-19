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

// Model, Collection 클래스 만들어서 이터러블 프로토콜 지원하기

// Collection Class
// - contructor: 배열을 받아서 this에 할당
// - at(): 배열의 index로 배열의 값을 READ
// - add(): 배열에 값을 추가 AND 생성자를 리턴
// - 이터레이터로 만드는 [Symbol.iterator]() 메소드 생성

class Collection {
  constructor(models = []) {
    this._models = models;
  }
  at(idx) {
    return this._models[idx];
  }
  add(model) {
    this._models.push(model);
    return this;
  }
  *[Symbol.iterator]() {
    yield *this._models;
  }
}

// Model Class
// - contructor: 객체를 받아서 this에 할당.
// - get(): 생성된 객체의 프로퍼티 값을 READ
// - set(): 생성된 객체의 값을 업데이트 AND 생성자를 리턴

class Model {
  constructor(attrs = {}) {
    this._attrs = attrs;
  }
  get(k) {
    return this._attrs[k];
  }
  set(k, v) {
    this._attrs[k] = v;
    return this;
  }
}

// 1. Collection Class 를 생성
// 2. Collection 로 생성된 배열에 add() 메소드로 Model 클래스로 만든 객체를 추가
// 3. Collection 클래스의 at 메소드로 원하는 순서의 Model 객체에 접근하고 Model 클래스의 get() 메소드로 값으로 READ

const coll = new Collection();
coll.add(new Model({id: 1, name: 'mkp'}));
coll.add(new Model({id: 2, name: 'kan'}));
coll.add(new Model({id: 3, name: 'ldk'}));

// 1. 리스트안에 객체를 순회하면서 리스트의 name 을 대문자로 변경
// _.go(
//   coll,
//   _.map( model => model.set('name', model.get('name').toUpperCase())),
//   log
// )

// 2. Product, Products - 메서드를 함수형으로 구현하기
// - Products 클래스 Collection 클래스를 상속
// - Products 클래스에 totalPrice(), getPrice() 메소드를 함수형으로 개발
// - Product 클래스 Model 클래스를 상속
class Products extends Collection {
  totalPrice() {
    return _.go(
      this,
      _.map(product => (product.get('price'))),
      _.reduce((a, b) => a + b)
    )
  }
  getPrice() {
    return _.go(
      this,
      _.map(product => (product.get('price')))
    )
  }
}
class Product extends Model {}
const products = new Products();
products.add(new Product({id: 1, price: 2000}));
products.add(new Product({id: 2, price: 3000}));
products.add(new Product({id: 3, price: 5000}));
console.log(products.getPrice())


// ## 시간을 이터러블로 다루기
// ### range 와 take 의 재해석

// 가로로 평가
// _.go(
//   _.range(10), // 0 ~ 9까지의 배열
//   _.take(3), // 앞에서부터 3개만 자르기
//   _.each(log)
// )

// 세로로 평가
// if. 오래걸리는 로직의 처리라면 하나씩 처리하는 것이 유리하다. (동시성)
// _.go(
//   L.range(10), // 0 ~ 9까지의 이터러블, 최대 10번
//   L.take(3), // 최대 3개의 값이 필요, 최대 3번의 일을 수행
//   L.each(log)
// )

// 자동차 경주 - 할일들을 이터러블(리스트)로 바라보기
// 2초에 딜레이로 track 에서 car 를 하나씩 뽑아서, 탑승자가 4명인 차들만 출발
const track = [
  { car: ['철수', '영희', '철희', '영수'] },
  { car: ['하든', '커리', '듀란트', '탐슨'] },
  { car: ['폴', '어빙', '릴라드', '맥컬럼'] },
  { car: ['스파이더맨', '아이언맨'] },
  { car: [] },
]

// _.go(
//   L.range(Infinity),
//   L.map(i => track[i]),
//   L.map(({car}) => car),
//   L.takeWhile(({length}) => (length >= 3)),
//   L.map(_.delay(1000)), // 임의적인 시간 딜레이 (데이터 처리....)
//   _.each(log)
// )