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
function f1(list) {
  let acc = 0;
  for (const a of list) {
    if(a % 2) acc = acc + (a * a);
  }
  return acc;
}

function f2(list) {
  let acc = 0;
  for (const a of L.filter(a => a % 2, list)) {
    acc = acc + (a * a);
  }
  return acc;
}
```

### 값 변화 후 변수 할당을 map 으로

- map 으로 값을 변화시킨 후 새로운 객체를 리턴 OR 값에 부여

```js
function f2(list) {
  let acc = 0;
  for (const a of L.map(a => a * a, L.filter(a => a % 2, list))) {
    acc = acc + a;
  }
  return acc;
}
```


