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