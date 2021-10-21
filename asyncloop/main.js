const delay = (timeout) => new Promise((res, rej) => setTimeout(res, timeout));

// (async function () {
//   for (let i = 0; i < 10; i++) {
//     console.log(i);
//     await delay(2000);
//   }
// })();

// is equivalent to

function asyncLoop(generator) {
  const gen = generator();
  generatorRunner(gen);
}

function isThenable(fn) {
  return typeof fn.then === "function";
}

function generatorRunner(generator) {
  const firstStep = generator.next();
  const step = {
    next: () => generator.next(),
    current: firstStep,
  };
  generatorLoop(step);
}

function generatorLoop(step) {
  if (step.current.value === void 0) {
    return;
  }
  if (isThenable(step.current.value)) {
    step.current.value.then(() => {
      const next = step.next();
      step.current = next;
      generatorLoop(step);
    });
  } else {
    const next = step.next();
    step.current = next;
    generatorLoop(step);
  }
}

asyncLoop(function* () {
  for (let i = 0; i < 5; i++) {
    console.log(i);
    yield delay(2000);
    yield "test"; // not promise
  }
});
