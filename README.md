# 함수형 프로그래밍과 JavaScript ES6+ 응용편- Inflean

- 함수형 프로그래밍 은 선언형 프로그래밍 이다.

## 프로그래밍 패러다임

- 명령형 프로그래밍: 프로그래밍의 상태와 상태를 변경시키는 구문의 관점에서 연산을 설명하는 방식
- 알고리즘을 명시하고 목표는 명시 안함.
- 선언형 프로그래밍: 어떤 방법으로 해야 하는지(How)를 나타내기보다 무엇(What)과 같은지를 설명하는 방식
- 알고리즘 명시하지 않고 목표만 명시.

```js
// 명령형
for (let i = 0; i < 10; i++) {
  console.log(i)
}

// 선언형
num(10);
```

### if 를 대신하여 L.fiter 사용

```js
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

// L.filter 활용
function f2(limit, list) {
  let acc = 0;
  for (const a of L.filter(a => a % 2, list)) {
    acc = acc + (a * a);
    limit = limit - 1;
    if (limit == 0) break;
  }
  return acc;
}
```

### 값 변화 후 변수 할당을 map 으로

- map 으로 값을 변화시킨 후 새로운 객체를 리턴 OR 값에 부여

```js
// L.map 활용
function f2(limit, list) {
  let acc = 0;
  for (const a of L.map(a => a * a, L.filter(a => a % 2, list))) {
    acc = acc + a;
    limit = limit - 1;
    if (limit == 0) break;
  }
  return acc;
}
```

### break -> take

- if ~ break 부분을 take 로 변경

```js
// L.talk 활용
function f2(limit, list) {
  let acc = 0;
  for (const a of L.take(limit, L.map(a => a * a, L.filter(a => a % 2, list)))) {
    acc = acc + a;
  }
  return acc;
}
```

### 축약 및 합산을 reduce

```js
const add = (a, b) => a + b;
function f2(limit, list) {
  return _.reduce(
    add,
    L.take(limit,
      L.map(a => a * a,
        L.filter(a => a % 2, list)))
  )
}

// _go 를 활용하여 더 읽기 쉬운 표현으로 변화
function f2(limit, list) {
  return _.go(
    list,
    L.filter(a => a % 2),
    L.map(a => a * a),
    L.take(limit),
    _.reduce(add)
  )
}
```

### while -> range

```js
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
```

### 별찍기

```js
// 별찍기
const strJoin = (sep = '') => _.reduce((acc, a) => `${acc}${sep}${a}`);

_.go(
  L.range(1, 6),
  L.map(L.range),
  L.map(L.map( a => '*' )),
  L.map(strJoin()),
  strJoin('\n'),
  log
)
```

### 구구단

```js
_.go(
  _.range(2, 10),
  _.map(a => _.go(
    _.range(1, 10),
    _.map(b => `${a} X ${b} = ${a * b}`),
    strJoin('\n'),
  )),
  strJoin('\n\n'),
  log
)
```

### 나이합산

- 코드를 기능별로 추상화 시킬 수 있다.

```js
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
_.go(
  users,
  _.map(getAge),
  _.filter(limitAge),
  _.reduce(add),
  log
);
```


### 질문

- map, filter, reduce 들을 조합해서 사용할때, 순회를 조합한 순서대로 돌기때문에 더 느려지는 건 아닐까?
- find, some, every 같은 함수 혹은 유사한 로직을 구현할 때 지연평가의 혜택을 받게 된다.
- 모든 값들을 평가해야되는 상황에서는 L.- 함수들도 모든 값들을 평가하게 되는데, 그렇다면 결국 L.- 함수는 일부분만 평가하면 되는 상황에서만 효용성이 있지 않을까?
- 퍼포먼스 차이가 거의 없다. 훨씬 읽기 좋은 코드를 만들 수 있다.

### query, queryToObject (오브젝트를 쿼리스트링 형식으로 만들기)

- 결과값: a=1&c=CC&d=DD

```js
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
```

### map 으로 안전하게 합성하기

- map 을 활용하여 예상가능한 에러가 발생하지 않도록 합성

```js
// map 으로 합성하기
const f = x => x + 10;
const g = x => x - 5;

// fg 함수에 파라미터가 들어오지 않을 경우 NaN 에러가 난다.
const fg = x => f(g(x));

// map 을 활용하여 안전하게 합성 할 수 있다.
// 값이 안들어온 경우 아무 결과도 리턴하지 않는다.
_.go(
  [10],
  _.map(fg),
  _.each(log)
)
```

### find 를 대신하여 filter 사용

- if 문 같은 가드를 할 필요가 없다.

```js
// find 를 대신 filter 사용
const findUser = _.find(user => user.user === 'mkp', users);
if(findUser) log(findUser); // findUser 에 값이 있을 경우 실행

// filter 를 활용하여 재합성
const findUser2 = _.pipe(
  _.filter(user => user.age > 10),
  _.take(1),
  _.each(log)
)
```

## 객체를 이터러블 프로그래밍으로 다루기

- 아직 평가가 완료되지 않은 이터레이터를 만듦으로써 최적화 여지를 남기고 값을 다룬다.
- 지연성: 이처럼 값을 실제 사용할 때까지 계산을 늦춰서 불필요한 계산을 하지 않는다.
- 동시성: 평가순서가 가로 -> 세로로 변경 / 하나의 함수에서 모든 값이 아닌 하나의 값만 평가하여 내보냄
- 모나드: 함수함성

### values, entries, keys

- Object.values, Object.entries, Object.keys 를 지연성으로 구현

```js
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

_.go(
  users,
  lazyObjValues, // 지연적으로 평가
  _.map(a => a + ' Good!'),
  _.take(2), // 지연적으로 평가하기 때문에 2개의 값만 평가한다.
  _.each(log)
)
```

### object

- [['a', 1], ['b', 2], ['c', 3]] 형태를 {a: 1, b: 2, c: 3} 형태로 생성
- 이터러블 프로토콜을 사용하는 모든 것에 적용가능 (map 에도 적용)

```js
// object
// [['a', 1], ['b', 2], ['c', 3]] 형태를 {a: 1, b: 2, c: 3} 형태로 생성
const object = (entries) => _.go(
  entries,
  _.map(([k, v]) => ({[k]: v})),
  _.reduce(Object.assign)
)

// reduce 하나만으로 표현
const object2 = (entries) => _.reduce((obj, [k, v]) => (obj[k] = v, obj), {}, entries);
```

### mapObject

- 오브젝트를 순회하면서 값을 평가

```js
// mapObject 오브젝트를 순회하면 값 평가
const mapObject = (f, obj) => _.go(
  obj,
  lazyObjEntries,
  _.map(([k, v]) => [k, f(v)]),
  object2
)
```

### pick

- 오브젝트에서 원하는 값만 추출해서 새로운 오브젝트 생성

```js
// pick, 오브젝트에서 원하는 값만 추출해서 새로운 오브젝트 생성
const pick = (keys, obj) => _.go(
  keys,
  _.map((k) => [k, obj[k]]),
  _.reject(([_, v]) => v === undefined),
  object2
)
```

### indexBy

- 배열을 index 를 가진 object 로 변경
- 한바퀴를 순회하고나면 데이터를 더욱 빠르게 key로 찾을 수 있다.

```js
// indexBy 된 것을 filter 하기
const users2 = _.indexBy(user => user.id, users);
const indexByFilter = (f, obj) =>  _.go(
  obj,
  lazyObjEntries,
  _.filter(([_, a]) => f(a)),
  object2,
)
```

## 객체지향과 함께 사용

### Model, Collection 클래스 만들어서 이터러블 프로토콜 지원하기

- 함수형 프로그래밍이 객체지향을 대체한다고 생각 X
- 함수형 프로그래밍은 언어자체를 대체하는 것

#### Collection Class
- contructor: 배열을 받아서 this에 할당
- at(): 배열의 index로 배열의 값을 READ
- add(): 배열에 값을 추가 AND 생성자를 리턴
- 이터레이터로 만드는 [Symbol.iterator]() 메소드 생성
```js
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
```

#### Model Class
- contructor: 객체를 받아서 this에 할당.
- get(): 생성된 객체의 프로퍼티 값을 READ
- set(): 생성된 객체의 값을 업데이트 AND 생성자를 리턴

```js

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
```

#### 기본적인 응용

1. Collection Class 를 생성
2. Collection 로 생성된 배열에 add() 메소드로 Model 클래스로 만든 객체를 추가
3. Collection 클래스의 at 메소드로 원하는 순서의 Model 객체에 접근하고 Model 클래스의 get() 메소드로 값으로 READ

```js
const coll = new Collection();
coll.add(new Model({id: 1, name: 'mkp'}));
coll.add(new Model({id: 2, name: 'kan'}));
coll.add(new Model({id: 3, name: 'ldk'}));

// 1. 리스트안에 객체를 순회하면서 리스트의 name 을 대문자로 변경
_.go(
    coll,
    _.map( model => model.set('name', model.get('name').toUpperCase())),
    log
)
```

#### Product, Products - 메서드를 함수형으로 구현하기

- Products 클래스 Collection 클래스를 상속
- Products 클래스에 totalPrice(), getPrice() 메소드를 함수형으로 개발
- Product 클래스 Model 클래스를 상속

```js
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
console.log(products.getPrice());
```


## 시간을 이터러블로 다루기

### range 와 take 의 재해석

```js
// 가로로 평가
_.go(
  _.range(10), // 0 ~ 9까지의 배열
  _.take(3), // 앞에서부터 3개만 자르기
  _.each(log)
)

// 세로로 평가
// if. 오래걸리는 로직의 처리라면 하나씩 처리하는 것이 유리하다. (동시성)
_.go(
  L.range(10), // 0 ~ 9까지의 이터러블, 최대 10번
  L.take(3), // 최대 3개의 값이 필요, 최대 3번의 일을 수행
  L.each(log)
)
```

### takeWhile, takeUntil

- takeWhile: true 값들만 return
- takeUntil: 처음 true 로 만난 값까지만 return

### 자동차 경주 - 할일들을 이터러블(리스트)로 바라보기

- 2초에 딜레이로 track 에서 car 를 하나씩 뽑아서, 탑승자가 4명인 차들만 출발

```js
const track = [
  { car: ['철수', '영희', '철희', '영수'] },
  { car: ['하든', '커리', '듀란트', '탐슨'] },
  { car: ['폴', '어빙', '릴라드', '맥컬럼'] },
  { car: ['스파이더맨', '아이언맨'] },
  { car: [] },
]

_.go(
  L.range(Infinity),
  L.map(i => track[i]),
  L.map(({car}) => car),
  L.takeWhile(({length}) => (length >= 3)),
  L.map(_.delay(1000)), // 임의적인 시간 딜레이 (데이터 처리....)
  _.each(log)
)
```
