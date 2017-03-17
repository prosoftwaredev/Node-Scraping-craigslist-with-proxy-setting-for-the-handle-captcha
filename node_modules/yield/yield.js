// yield.js 0.0.6
// https://github.com/ttaubert/yield-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// yield.js may be freely distributed under the MIT license.

!(function (window, undefined) {
  "use strict";

  function isGeneratorObj(obj) {
    return typeof obj === "object" &&
           Object.prototype.toString.call(obj) === "[object Generator]";
  }

  function* fromArray(it) {
    if (isGeneratorObj(it)) {
      for (let n = it.next(); !n.done; n = it.next()) {
        yield n.value;
      } // yield*
      return;
    }

    for (let i = 0; i < it.length; i++) {
      yield it[i];
    }
  }

  function toArray(it) {
    if (Array.isArray(it)) {
      return it;
    }

    return reduce(it, function (acc, x) { return acc.concat([x]) }, []);
  }

  function source(it) {
    if (isGeneratorObj(it)) {
      return it;
    }

    if (Array.isArray(it)) {
      return fromArray(it);
    }

    throw "unknown source type " + it;
  }

  function* range(lo, hi) {
    while (lo <= hi) {
      yield lo++;
    }
  }

  function each(it, f) {
    it = source(it);
    for (let n = it.next(); !n.done; n = it.next()) {
      f(n.value);
    }
  }

  function* map(it, f) {
    it = source(it);
    for (let n = it.next(); !n.done; n = it.next()) {
      yield f(n.value);
    }
  }

  function* filter(it, f) {
    it = source(it);
    for (let n = it.next(); !n.done; n = it.next()) {
      if (f(n.value)) {
        yield n.value;
      }
    }
  }

  function reject(it, f) {
    return filter(it, function (x) { return !f(x) });
  }

  function compact(it) {
    return filter(it, function (x) { return x });
  }

  function reduce(it, f, acc) {
    each(it, function (x) { acc = f(acc, x) });
    return acc;
  }

  function min(it) {
    return reduce(it, function (acc, x) { return x < acc ? x : acc }, Infinity);
  }

  function max(it) {
    return reduce(it, function (acc, x) { return x > acc ? x : acc }, -Infinity);
  }

  function uniq(it) {
    let seen = new Set();
    return filter(it, function (x) {
      if (!seen.has(x)) {
        seen.add(x);
        return true;
      }

      return false;
    });
  }

  function some(it, f) {
    return !filter(it, f).next().done;
  }

  function every(it, f) {
    return reject(it, f).next().done;
  }

  function contains(it, v) {
    return some(it, function (x) { return x === v });
  }

  function find(it, f) {
    let n = filter(it, f).next();
    return n.done ? undefined : n.value;
  }

  function size(it) {
    return reduce(it, function (acc) { return acc + 1 }, 0);
  }

  function drop(it, c) {
    return filter(it, function () { return --c < 0 });
  }

  function* take(it, c) {
    it = source(it);
    for (let n = (c > 0 && it.next()); n && !n.done; n = (--c > 0 && it.next())) {
      yield n.value;
    }
  }

  function* flattenShared(it, lvl) {
    if (lvl > 0 && (isGeneratorObj(it) || Array.isArray(it))) {
      it = source(it);
      for (let n = it.next(); !n.done; n = it.next()) {
        let it2 = flattenShared(n.value, lvl - 1); // yield*
        for (let n2 = it2.next(); !n2.done; n2 = it2.next()) {
          yield n2.value;
        }
      }
    } else {
      yield it;
    }
  }

  function flatten(it) {
    return flattenShared(it, Infinity);
  }

  function flattenOnce(it) {
    return flattenShared(it, 2);
  }

  function flatMap(it, f) {
    return flattenOnce(map(it, f));
  }

  function union() {
    return uniq(flattenOnce(flattenOnce([].slice.call(arguments))));
  }

  function difference(it) {
    let rest = new Set();
    each(union([].slice.call(arguments, 1)), function (x) { rest.add(x) });
    return reject(it, function (x) { return rest.has(x) });
  }

  function without(it) {
    return difference(it, [].slice.call(arguments, 1));
  }

  function partition(it, f) {
    function next() {
      return (last && last.done) ? last : last = it.next();
    }

    function* piter(q, qother, p) {
      for (let n = next(); !n.done; n = next()) {
        // yield* dequeue(q);
        while (q.length) {
          yield q.shift();
        }

        if (f(n.value) == p) {
          yield n.value;
        } else {
          qother.push(n.value);
        }
      }

      // yield* dequeue(q);
      while (q.length) {
        yield q.shift();
      }
    }

    it = source(it);
    let last, qtrue = [], qfalse = [];
    return [piter(qtrue, qfalse, true), piter(qfalse, qtrue, false)];
  }

  window.y = {
    contains: contains,
    compact: compact,
    difference: difference,
    drop: drop,
    each: each,
    every: every,
    filter: filter,
    find: find,
    flatMap: flatMap,
    flatten: flatten,
    flattenOnce: flattenOnce,
    fromArray: fromArray,
    min: min,
    map: map,
    max: max,
    partition: partition,
    range: range,
    reduce: reduce,
    reject: reject,
    size: size,
    some: some,
    take: take,
    toArray: toArray,
    union: union,
    uniq: uniq,
    without: without
  };
})(this);
