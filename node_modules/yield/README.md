# yield.js

library providing functional helpers for generators

[![build status](https://secure.travis-ci.org/ttaubert/yield-js.png)](http://travis-ci.org/ttaubert/yield-js)

Please note that this module currently requires node.js v0.11.2 (or higher)
started with `--use-strict` and `--harmony` as it makes heavy use of generators,
sets and block-scoped variables.

# example

``` js
// Generator containing the sequence of natural numbers.
function* nat() {
  let i = 1;
  while (true) {
    yield i++;
  }
}

// Sequence of all Mersenne numbers.
function mersenneNumbers() {
  return y.map(nat(), function (x) { return Math.pow(2, x) - 1 });
}

// Sequence of all Mersenne numbers that are prime.
function mersennePrimes() {
  function isPrime(n) {
    return y.every(y.range(2, n - 1), function (x) { return n % x });
  }

  return y.filter(y.drop(mersenneNumbers(), 1), isPrime);
}

y.toArray(y.take(mersennePrimes(), 3)); // [3, 7, 31];
```

# methods

## fromArray(arr)

Utility function that creates a generator from a given array `arr`.

``` js
let g = y.fromArray([1, 2]);
yole.log(g.next().value, g.next().value); // prints 1 2
```

## toArray(it)

Utility function that yumes the whole sequence `it` and returns an array
containing all of its values.

``` js
function* g() {
  yield 1;
  yield 2;
  yield 3;
}

y.toArray(g()); // [1, 2, 3]
```

## range(from, to)

Creates a generator containing an arithmetic progression starting with the value
`from` up to including value `to`.

``` js
y.toArray(y.range(1, 3)); // [1, 2, 3]
```

## map(it, fun)

Creates a generator containing the results of applying `fun` to all values of
`it`.

``` js
function square(x) {
  return x * x;
}

y.toArray(y.map(y.range(1, 3), square)); // [1, 4, 9]
y.toArray(y.map([-1, -2, -3], square)); // [1, 4, 9]
```

## filter(it, p)

Creates a generator containing values of `it` where the predicate `p` holds.

``` js
function odd(x) {
  return x % 2;
}

y.toArray(y.filter(y.range(1, 6), odd)); // [1, 3, 5]
y.toArray(y.filter([1, 2, 3, 4], odd)); // [1, 3]
```

## reject(it, p)

Creates a generator containing values of `it` where the predicate `p` does
not hold.

``` js
function odd(x) {
  return x % 2;
}

y.toArray(y.reject(y.range(1, 6), odd)); // [2, 4, 6]
y.toArray(y.reject([1, 2, 3, 4], odd)); // [2, 4]
```

## compact(it)

Creates a generator containing all truthy values of `it`.

``` js
y.toArray(y.compact(y.range(-1, 1))); // [-1, 1]
y.toArray(y.compact([1, "", 2, 0, true, false])); // [1, 2, true]
```

## reduce(it, fun)

Consumes the whole sequence `it` and reduces all of its values down to a single
value. `fun` is called on each step with the current reduction state and value
as arguments.

``` js
function sum(it) {
  return y.reduce(it, function (acc, x) { return acc + x }, 0);
}

sum([2, 3, 4]); // 9
sum(y.range(1, 3)); // 6
sum(y.range(-1, 1)); // 0
```

## each(it, fun)

Consumes the whole sequence `it` calling the given function `fun` for every
value, passing the value as a single argument.

``` js
// Show alert boxes for numbers 1 to 3.
y.each(y.range(1, 3), alert);
y.each([1, 2, 3], alert);
```

## min(it)

Consumes the whole sequence `it` and returns the minimum value found or
`+Infinity` for empty sequences.

``` js
y.min(y.range(1, 6)); // 1
y.min([5, 1, 7]); // 1
```

## max(it)

Consumes the whole sequence `it` and returns the maximum value found or
`-Infinity` for empty sequences.

``` js
y.max(y.range(1, 6)); // 6
y.max([5, 1, 7]); // 7
```

## uniq(it)

Returns a generator containing all distinct values from the given sequence `it`.

``` js
function mod3(x) {
  return x % 3;
}

y.uniq(y.map(y.range(1, 9), mod3)); // [1, 2, 0]
y.uniq(['a', 'b', 'a', 'c']); // ['a', 'b', 'c']
```

## every(it, p)

Returns `true` if the given predicate `p` holds for all values of the given
sequence `it`. Returns `true` as well for empty sequences.

``` js
function greaterThanZero(x) {
  return x > 0;
}

y.every(y.range(1, 5), greaterThanZero); // true
y.every([0, 1, 2, 3, 4], greaterThanZero); // false
y.every([], greaterThanZero); // true
```

## some(it, p)

Returns `true` if the given predicate `p` holds for at least one value of the
given sequence `it`. Returns `false` for empty sequences.

``` js
function equalToZero(x) {
  return x === 0;
}

y.some(y.range(1, 5), equalToZero); // false
y.some([0, 1, 2, 3, 4], equalToZero); // true
y.some([], equalToZero); // false
```

## size(it)

Consumes the whole sequence `it` and returns the number of values found.

``` js
y.size(y.range(1, 5)); // 5
y.size([1, 2, 3]); // 3
```

## contains(it, val)

Returns `true` if the given value `val` is contained in the given sequence `it`,
`false` otherwise.

``` js
y.contains(y.range(0, 5), 0); // true
y.contains([1, 2, 3, 4, 5], 0); // false
```

## find(it, p)

Returns the first value of the given sequence `it` for which the given predicate
`p` holds.

``` js
function greaterThanThree(x) {
  return x > 3;
}

y.find(y.range(1, 6), greaterThanThree); // 4
y.find([3, 4, 5], greaterThanThree); // 4
y.find([], greaterThanThree); // undefined
```

## take(it, num)

Returns a generator containing the first `num` values from the given sequence
`it`.

``` js
y.take(y.range(1, 6), 3); // [1, 2, 3]
y.take([1, 2, 3], 2); // [1, 2]
```

## drop(it, num)

Returns a generator containing all but the first `num` values from the given
sequence `it`.

``` js
y.drop(y.range(1, 6), 3); // [4, 5, 6]
y.drop([1, 2, 3], 1); // [2, 3]
```

## flatten(it)

Flattens the given (nested) sequence `it`.

``` js
function* g() {
  yield 1;
  yield 2;
  yield [3, 4];
}

y.flatten([0, g()]); // [0, 1, 2, 3, 4]
y.flatten([1, [2], [3, [[4]]]]); // [1, 2, 3, 4]
```

## flattenOnce(it)

Flattens the given (nested) sequence `it` by a single level.

``` js
y.flattenOnce([1, [2], [3, [[4]]]]); // [1, 2, 3, [[4]]]
```

## flatMap(it, fun)

Creates a generator by applying `fun` to all values of `it` and using the
elements of the resulting sequences.

``` js
function map(x) {
  return [x, x];
}

y.flatMap(y.range(1, 3), map); // [1, 1, 2, 2, 3, 3]
y.flatMap([1, 2, 3], map); // [1, 1, 2, 2, 3, 3]
y.flatMap([1, [2]], map); // [1, 1, [2], [2]]
```

## union(it [, it2, ...])

Creates a generator containing the union of all passed sequences.

``` js
y.union(y.range(1, 3), [2, 3, 4], y.range(1, 6)); // [1, 2, 3, 4, 5, 6]
```

## difference(it, oth [, oth2, ...])

Creates a generator containing all values of `it` that are not contained in
`oth` and all further given sequences.

``` js
y.difference(y.range(1, 6), [3, 4], y.range(1, 2)); // [5, 6]
```

## without(it, val [, val2, ...])

Creates a generator containing all values of `it` that do not match `val` or
any other of the given values.

``` js
y.without(y.range(1, 6), 1, 2); // [3, 4, 5, 6]
y.without([1, 2, 3, 4], 1, 2); // [3, 4]
```

## partition(it, p)

Partitions the given sequence `it` according to the given predicate `p`. It
returns an array with the first entry containing a generator with all values of
`it` for which the predicate `p` holds. The second entry will contain a
generator with all values for which the predicate does not hold.

``` js
function greaterThanThree(x) {
  return x > 3;
}

y.partition(y.range(1, 6), greaterThanThree); // [[4, 5, 6], [1, 2, 3]]
y.partition([2, 3, 4, 5], greaterThanThree); // [[4, 5], [2, 3]]
```

# install

For node.js, with [npm](https://npmjs.org) do:

```
npm install yield
```

# todos

* Use [yield*](http://wiki.ecmascript.org/doku.php?id=harmony:generators#delegating_yield) when implemented.
* Use [for...of](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Statements/for...of) when implemented.
* Use [rest parameters](http://wiki.ecmascript.org/doku.php?id=harmony:rest_parameters) when implemented.

# license

MIT

