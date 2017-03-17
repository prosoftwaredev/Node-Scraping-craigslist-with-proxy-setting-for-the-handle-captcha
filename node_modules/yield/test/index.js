let test = require("tape");
let y = require("../");

let fromArray = y.fromArray;
let toArray = y.toArray;

test("range", function (t) {
  t.plan(5);

  t.deepEqual(toArray(y.range(6, 5)), []);
  t.deepEqual(toArray(y.range(0, -1)), []);
  t.deepEqual(toArray(y.range(5, 5)), [5]);
  t.deepEqual(toArray(y.range(1, 5)), [1, 2, 3, 4, 5]);
  t.deepEqual(toArray(y.range(-1, 5)), [-1, 0, 1, 2, 3, 4, 5]);
});

test("map", function (t) {
  t.plan(3);

  function f(x) { return x * x }
  t.deepEqual(toArray(y.map(y.range(1, 0), f)), []);
  t.deepEqual(toArray(y.map(y.range(1, 4), f)), [1, 4, 9, 16]);
  t.deepEqual(toArray(y.map([-1, -2, -3, -4], f)), [1, 4, 9, 16]);
});

test("filter", function (t) {
  t.plan(3);

  function f(x) { return x % 2 }
  t.deepEqual(toArray(y.filter(y.range(1, 0), f)), []);
  t.deepEqual(toArray(y.filter(y.range(1, 6), f)), [1, 3, 5]);
  t.deepEqual(toArray(y.filter([1, 2, 3, 4, 5, 6], f)), [1, 3, 5]);
});

test("reject", function (t) {
  t.plan(2);

  function f(x) { return x % 2 }
  t.deepEqual(toArray(y.reject(y.range(1, 0), f)), []);
  t.deepEqual(toArray(y.reject(y.range(1, 6), f)), [2, 4, 6]);
});

test("compact", function (t) {
  t.plan(3);

  let it = fromArray([1, "", 2, 0, true, false]);
  t.deepEqual(toArray(y.compact(it)), [1, 2, true]);
  t.deepEqual(toArray(y.compact(y.range(-1, 1))), [-1, 1]);
  t.deepEqual(toArray(y.compact([1, "", 2, 0, true, false])), [1, 2, true]);
});

test("each", function (t) {
  t.plan(2);

  let last = 0;
  y.each(y.range(1, 6), function (x) { last = x });
  t.equal(last, 6);

  y.each([6, 5, 4, 3, 2, 1], function (x) { last = x });
  t.equal(last, 1);
});

test("reduce", function (t) {
  t.plan(2);

  function f(acc, x) { return acc + x }
  function sum(it) { return y.reduce(it, f, 0) }
  t.equal(sum(y.range(1, 3)), 6);
  t.equal(sum(y.range(-1, 1)), 0);
});

test("min, max", function (t) {
  t.plan(2);

  t.equal(y.min(y.range(1, 6)), 1);
  t.equal(y.max(y.range(1, 6)), 6);
});

test("uniq", function (t) {
  t.plan(2);

  function f(x) { return x % 3 }
  t.deepEqual(toArray(y.uniq(y.map(y.range(1, 9), f))), [1, 2, 0]);
  t.deepEqual(toArray(y.uniq(['a', 'b', 'a', 'c'])), ['a', 'b', 'c']);
});

test("every", function (t) {
  t.plan(5);

  function f(x) { return x > 0 }
  t.equal(y.every(y.range(1, 5), f), true);
  t.equal(y.every(y.range(0, 5), f), false);
  t.equal(y.every([], f), true);
  t.equal(y.every([1, 2, 3], f), true);
  t.equal(y.every([0, 1, 2], f), false);
});

test("some", function (t) {
  t.plan(5);

  function f(x) { return x === 0 }
  t.equal(y.some(y.range(0, 5), f), true);
  t.equal(y.some(y.range(1, 5), f), false);
  t.equal(y.some([], f), false);
  t.equal(y.some([0, 1, 2], f), true);
  t.equal(y.some([1, 2, 3], f), false);
});

test("size", function (t) {
  t.plan(1);

  t.equal(y.size(y.range(1, 6)), 6);
});

test("contains", function (t) {
  t.plan(4);

  t.equal(y.contains(y.range(0, 5), 0), true);
  t.equal(y.contains(y.range(1, 5), 0), false);
  t.equal(y.contains([0, 1, 2, 3], 0), true);
  t.equal(y.contains([0, 1, 2, 3], 4), false);
});

test("find", function (t) {
  t.plan(3);

  function f(x) { return x > 3 }
  t.equal(y.find(y.range(1, 6), f), 4);
  t.equal(y.find([3, 4, 5, 6], f), 4);
  t.equal(y.find([], f), undefined);
});

test("take", function (t) {
  t.plan(2);

  t.deepEqual(toArray(y.take(y.range(1, 6), 3)), [1, 2, 3]);
  t.deepEqual(toArray(y.take([1, 2, 3, 4, 5, 6], 3)), [1, 2, 3]);
});

test("drop", function (t) {
  t.plan(2);

  t.deepEqual(toArray(y.drop(y.range(1, 6), 3)), [4, 5, 6]);
  t.deepEqual(toArray(y.drop([7, 8, 3, 4, 5, 6], 3)), [4, 5, 6]);
});

test("flatten", function (t) {
  t.plan(2);

  t.deepEqual(toArray(y.flatten([1, [2], [3, [[4]]]])), [1, 2, 3, 4]);

  function* f() { yield 1; yield [5, g()]; }
  function* g() { yield 3; yield 4 }
  let expected = [1, 1, 5, 3, 4, 3, 3, 4];
  t.deepEqual(toArray(y.flatten([1, [f()], [3, [[g()]]]])), expected);
});

test("flattenOnce", function (t) {
  t.plan(1);

  t.deepEqual(toArray(y.flattenOnce([1, [2], [3, [[4]]]])), [1, 2, 3, [[4]]]);
});

test("flatMap", function (t) {
  t.plan(3);

  function f(x) { return [x, x] }
  t.deepEqual(toArray(y.flatMap(y.range(1, 3), f)), [1, 1, 2, 2, 3, 3]);
  t.deepEqual(toArray(y.flatMap([1, 2, 3], f)), [1, 1, 2, 2, 3, 3]);
  t.deepEqual(toArray(y.flatMap([1, [2]], f)), [1, 1, [2], [2]]);
});

test("union", function (t) {
  t.plan(1);

  let ranges = [y.range(1, 3), [2, 3, 4], y.range(3, 5)];
  t.deepEqual(toArray(y.union.call(null, ranges)), [1, 2, 3, 4, 5]);
});

test("difference", function (t) {
  t.plan(1);

  t.deepEqual(toArray(y.difference(y.range(1, 6), [3, 4], y.range(1, 2))), [5, 6]);
});

test("without", function (t) {
  t.plan(2);

  t.deepEqual(toArray(y.without(y.range(1, 6), 1, 2)), [3, 4, 5, 6]);
  t.deepEqual(toArray(y.without([1, 2, 3, 4], 1, 2)), [3, 4]);
});

test("partition", function (t) {
  t.plan(4);

  function f(x) { return x > 3 }
  let parts = y.partition(y.range(1, 6), f);
  t.deepEqual(toArray(parts[0]), [4, 5, 6]);
  t.deepEqual(toArray(parts[1]), [1, 2, 3]);

  parts = y.partition([1, 2, 3, 4, 5, 6], f);
  t.deepEqual(toArray(parts[0]), [4, 5, 6]);
  t.deepEqual(toArray(parts[1]), [1, 2, 3]);
});

test("partition 2", function (t) {
  t.plan(4);

  function f(x) { return x % 2 }
  let parts = y.partition(y.range(1, 6), f);
  t.deepEqual(toArray(parts[0]), [1, 3, 5]);
  t.deepEqual(toArray(parts[1]), [2, 4, 6]);

  parts = y.partition([1, 2, 3, 4, 5, 6], f);
  t.deepEqual(toArray(parts[0]), [1, 3, 5]);
  t.deepEqual(toArray(parts[1]), [2, 4, 6]);
});

test("partition 3", function (t) {
  t.plan(6);

  function f(x) { return x % 2 }
  let parts = y.partition(y.range(1, 6), f);
  t.deepEqual(toArray(y.take(parts[0], 1)), [1]);
  t.deepEqual(toArray(parts[1]), [2, 4, 6]);
  t.deepEqual(toArray(parts[0]), [3, 5]);

  parts = y.partition([1, 2, 3, 4, 5, 6], f);
  t.deepEqual(toArray(y.take(parts[0], 1)), [1]);
  t.deepEqual(toArray(parts[1]), [2, 4, 6]);
  t.deepEqual(toArray(parts[0]), [3, 5]);
});

test("partition 4", function (t) {
  t.plan(12);

  function f(x) { return x % 2 }
  let parts = y.partition(y.range(1, 6), f);
  t.deepEqual(toArray(y.take(parts[0], 1)), [1]);
  t.deepEqual(toArray(y.take(parts[1], 1)), [2]);
  t.deepEqual(toArray(y.take(parts[0], 1)), [3]);
  t.deepEqual(toArray(y.take(parts[1], 1)), [4]);
  t.deepEqual(toArray(y.take(parts[0], 1)), [5]);
  t.deepEqual(toArray(y.take(parts[1], 1)), [6]);

  parts = y.partition([1, 2, 3, 4, 5, 6], f);
  t.deepEqual(toArray(y.take(parts[0], 1)), [1]);
  t.deepEqual(toArray(y.take(parts[1], 1)), [2]);
  t.deepEqual(toArray(y.take(parts[0], 1)), [3]);
  t.deepEqual(toArray(y.take(parts[1], 1)), [4]);
  t.deepEqual(toArray(y.take(parts[0], 1)), [5]);
  t.deepEqual(toArray(y.take(parts[1], 1)), [6]);
});

test("mersenne primes", function (t) {
  t.plan(3);

  function* nat() {
    let i = 1;
    while (true) {
      yield i++;
    }
  }

  function mersenneNumbers() {
    return y.map(nat(), function (x) { return Math.pow(2, x) - 1 });
  }

  function mersennePrimes() {
    function isPrime(n) {
      return y.every(y.range(2, n - 1), function (x) { return n % x });
    }

    return y.filter(y.drop(mersenneNumbers(), 1), isPrime);
  }

  let it = mersennePrimes();
  t.equal(it.next().value, 3);
  t.equal(it.next().value, 7);
  t.equal(it.next().value, 31);
});
