import * as _ from "fxjs/Strict";
import * as L from "fxjs/Lazy";
import * as C from "fxjs/Concurrency";

// 콘솔로그
import { log } from "fxjs";

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
// console.log(products.getPrice())


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

// 결제 누락 처리 스케줄러
// 1. 결제사 api
const Impt = {
  payments: {
    1: [
      { imp_id: 11, order_id: 1, amount: 15000 },
      { imp_id: 12, order_id: 2, amount: 25000 },
      { imp_id: 13, order_id: 3, amount: 10000 }
    ],
    2: [
      { imp_id: 14, order_id: 4, amount: 25000 },
      { imp_id: 15, order_id: 5, amount: 45000 },
      { imp_id: 16, order_id: 6, amount: 15000 }
    ],
    3: [
      { imp_id: 17, order_id: 7, amount: 20000 },
      { imp_id: 18, order_id: 8, amount: 30000 }
    ],
    4: [],
    5: [],
    //...
  },
  getPayments: page => {
    console.log(`http://..?page=${page}`);
    return _.delay(1000 * 1, Impt.payments[page]);
  },
  cancelPayment: imp_id => Promise.resolve(`${imp_id}: 취소완료`)
};

// 가맹점 api
const DB = {
  getOrders: ids => _.delay(100, [
    { id: 1 },
    { id: 3 },
    { id: 7 }
  ])
};

const job = async () => {
  // 결제사에서 모든 결제내역을 가져오기
  const payments = await _.go(
    L.range(1, Infinity),
    L.map(i => Impt.getPayments(i)),
    L.takeUntil(({length}) => length < 3),
    _.flat,
  )

  // 가맹점에 결제된 내역
  const orderIds = await _.go(
    payments,
    _.map(pay => pay.order_id),
    DB.getOrders,
    _.map(order => order.id),
  )

  // 실제결제와 결제내역이 다른 것들은 결제취소처리
  _.go(
    payments,
    L.reject(pay => orderIds.includes(pay.order_id)),
    L.map(pay => pay.imp_id),
    L.map(Impt.cancelPayment),
    _.each(log)
  )
}

// 반복실행
// (function recur() {
//   // job().then(recur); // 끊기지 않는 요청으로 부하가 큼
//   // 5초에 한번만 실행
//   // if. 기존 요청이 5초보다 더 많이 걸린다고 한다면 job 이 끝나고 다시 요청하고, 5초 미만이면 5초에 한번만 실행
//   Promise.all([
//     _.delay(10000, undefined),
//     job()
//   ]).then(recur);
// })();


// 프론트엔드에서 함수형/이터러블/동시성 프로그래밍

// json -> 이미지 element 만들기
const images = {};
images.fetch = () => new Promise(res => setTimeout(() => res(
  [
    { name: "HEART", url: "https://s3.marpple.co/files/m2/t3/colored_images/45_1115570_1162087.png" },
    { name: "하트", url: "https://s3.marpple.co/f1/2019/1/1235206_1548918825999_78819.png" },
    { name: "2", url: "https://s3.marpple.co/f1/2018/1/1054966_1516076769146_28397.png" },{ name: "6", url: "https://s3.marpple.co/f1/2018/1/1054966_1516076919028_64501.png"},{"name":"도넛","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918758054_55883.png"},{"name":"14","url":"https://s3.marpple.co/f1/2018/1/1054966_1516077199329_75954.png"},{"name":"15","url":"https://s3.marpple.co/f1/2018/1/1054966_1516077223857_39997.png"},{"name":"시계","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918485881_30787.png"},{"name":"돈","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918585512_77099.png"},{"name":"10","url":"https://s3.marpple.co/f1/2018/1/1054966_1516077029665_73411.png"},{"name":"7","url":"https://s3.marpple.co/f1/2018/1/1054966_1516076948567_98474.png"},{"name":"농구공","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918719546_22465.png"},{"name":"9","url":"https://s3.marpple.co/f1/2018/1/1054966_1516077004840_10995.png"},{"name":"선물","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918791224_48182.png"},{"name":"당구공","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918909204_46098.png"},{"name":"유령","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918927120_12321.png"},{"name":"원숭이","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919417134_80857.png"},{"name":"3","url":"https://s3.marpple.co/f1/2018/1/1054966_1516076802375_69966.png"},{"name":"16","url":"https://s3.marpple.co/f1/2018/1/1054966_1516077254829_36624.png"},{"name":"안경","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918944668_23881.png"},{"name":"폭죽","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919005789_67520.png"},{"name":"폭죽 2","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919027834_48946.png"},{"name":"박","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919062254_67900.png"},{"name":"톱니바퀴","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919302583_24439.png"},{"name":"11","url":"https://s3.marpple.co/f1/2018/1/1054966_1516077078772_79004.png"},{"name":"핫도그","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919086961_23322.png"},{"name":"고기","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919274214_33127.png"},{"name":"책","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919326628_13977.png"},{"name":"돋보기","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919363855_26766.png"},{"name":"집","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919395033_19373.png"},{"name":"사람","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918696715_44274.png"},{"name":"연필","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919437239_32501.png"},{"name":"파일","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919468582_23707.png"},{"name":"스피커","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919495804_49080.png"},{"name":"트로피 ","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918438617_69000.png"},{"name":"카메라","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919847041_33220.png"},{"name":"그래프","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918521301_43877.png"},{"name":"가방","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918642937_11925.png"},{"name":"입술","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919886042_10049.png"},{"name":"fire","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920036111_19302.png"},{"name":"TV","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920054808_42469.png"},{"name":"핸드폰","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920109727_43404.png"},{"name":"노트북","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920142776_26474.png"},{"name":"전구","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920181784_14964.png"},{"name":"장미","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920264149_78607.png"},{"name":"맥주","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920312701_18073.png"},{"name":"마이크","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920397855_39832.png"},{"name":"별","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920420823_49166.png"},{"name":"와이파이","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920438005_35247.png"},{"name":"헤드폰","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920468136_82088.png"},{"name":"peace","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920538719_19072.png"},{"name":"계산기","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920348341_40080.png"},{"name":"poo 2","url":"https://s3.marpple.co/f1/2019/1/1235206_1548924259247_12839.png"},{"name":"poo 3","url":"https://s3.marpple.co/f1/2019/1/1235206_1548924850867_72121.png"},{"name":"poo 4","url":"https://s3.marpple.co/f1/2019/1/1235206_1548925154648_40289.png"},{"name":"poo","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918988097_38121.png"},{"name":"모니터","url":"https://s3.marpple.co/f1/2016/7/1043023_1469769774483.png"},{"name":"talk","url":"https://s3.marpple.co/f1/2019/1/1235206_1548927111573_76831.png"},{"name":"keyboard","url":"https://s3.marpple.co/f1/2018/1/1054966_1516330864360_25866.png"},{"name":"daily 2","url":"https://s3.marpple.co/f1/2019/1/1235206_1548926169159_58295.png"},{"name":"daily","url":"https://s3.marpple.co/f1/2018/7/1199664_1531814945451_49451.png"},{"name":"편지","url":"https://s3.marpple.co/f1/2019/1/1235206_1548920087850_99421.png"},{"name":"sns 하단바 2","url":"https://s3.marpple.co/f1/2019/1/1235206_1548917218903_88079.png"},{"name":"sns 하단바","url":"https://s3.marpple.co/f1/2019/1/1235206_1548917192465_28365.png"},{"name":"sns 이모지 6","url":"https://s3.marpple.co/f1/2019/1/1235206_1548927313417_99007.png"},{"name":"sns 이모지","url":"https://s3.marpple.co/f1/2019/1/1235206_1548927219485_18861.png"},{"name":"13","url":"https://s3.marpple.co/f1/2018/1/1054966_1516077164559_59630.png"},{"name":"iphone","url":"https://s3.marpple.co/f1/2016/7/1043023_1469769886837.png"},{"name":"아이패드","url":"https://s3.marpple.co/f1/2016/7/1043023_1469769820297.png"},{"name":"컴퓨터","url":"https://s3.marpple.co/f1/2016/7/1043023_1469769802862.png"},{"name":"5","url":"https://s3.marpple.co/f1/2018/1/1054966_1516076888018_74741.png"},{"name":"poo 1","url":"https://s3.marpple.co/f1/2019/1/1235206_1548924230868_28487.png"},{"name":"Sns icon_똥 안경","url":"https://s3.marpple.co/f1/2017/2/1043404_1487211657799.png"},{"name":"Sns icon_똥 웃음","url":"https://s3.marpple.co/f1/2017/2/1043404_1487211686108.png"},{"name":"4","url":"https://s3.marpple.co/f1/2018/1/1054966_1516076850148_36610.png"},{"name":"Sns icon_똥 놀림","url":"https://s3.marpple.co/f1/2017/2/1043404_1487211670017.png"},{"name":"달력","url":"https://s3.marpple.co/f1/2019/1/1235206_1548919531014_35045.png"},{"name":"자물쇠","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918410738_59815.png"},{"name":"손 이모지","url":"https://s3.marpple.co/f1/2019/1/1235206_1548918353391_54897.png"},{"name":"Sns icon_손바닥","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210472038.png"},{"name":"Sns icon_검지","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210393226.png"},{"name":"Sns icon_롹","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210522978.png"},{"name":"Sns icon_하이파이브","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210538695.png"},{"name":"Sns icon_브이","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210508758.png"},{"name":"Sns icon_중지","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210428137.png"},{"name":"Sns icon_주먹","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210372629.png"},{"name":"Sns icon_박수","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210444994.png"},{"name":"Sns icon_따봉","url":"https://s3.marpple.co/f1/2017/2/1043404_1487210488684.png"},{"name":"손 이모지 2","url":"https://s3.marpple.co/f1/2019/1/1235206_1548921736267_35010.png"},{"name":"손 이모지 3","url":"https://s3.marpple.co/f1/2019/1/1235206_1548922150829_10878.png"}
  ]), 3000))

_.go(
  images.fetch(),
  _.map(({name, url}) => `<img src="${url}" alt="${name}">`),
  _.join(''),
  log
)

// ... 나머지 연구중