function fnName() {
  try {
    throw new Error();
  } catch (e) {
    // matches this function, the caller and the parent
    const allMatches = e.stack.match(/(\w+)@|at (\w+) \(/g);
    // match parent function name
    const parentMatches = allMatches[1].match(/(\w+)@|at (\w+) \(/);
    // return only name
    return parentMatches[1] || parentMatches[2];
  }
}

const MyReact = (function () {
  let hooks = [],
    currentHook = 0; // array of hooks, and an iterator!
  return {
    render(Component, fName, index) {
      if (fName !== "App" && fName !== void 0) {
        currentHook = index;
      }
      let Comp;
      if (typeof Component === "string") {
        Comp = eval(`${Component}()`);
      } else {
        Comp = Component(); // run effects
      }
      currentHook = 0;
      return Comp;
    },
    useEffect(callback, depArray) {
      const hasNoDeps = !depArray;
      const deps = hooks[currentHook]; // type: array | undefined
      const hasChangedDeps = deps
        ? !depArray.every((el, i) => el === deps[i])
        : true;
      if (hasNoDeps || hasChangedDeps) {
        callback();
        hooks[currentHook] = depArray;
      }
      currentHook++; // done with this hook
    },
    useState(initialValue) {
      hooks[currentHook] = hooks[currentHook] || initialValue; // type: any
      const setStateHookIndex = currentHook; // for setState's closure!
      const parentFunctionName = fnName();
      const setState = (newState) => {
        if (typeof newState === "function") {
          hooks[setStateHookIndex] = newState(hooks[setStateHookIndex]);
        } else {
          hooks[setStateHookIndex] = newState;
        }
        this.render(
          window[parentFunctionName] || parentFunctionName,
          parentFunctionName,
          setStateHookIndex
        );
      };
      return [hooks[currentHook++], setState];
    },
    useRef(initialValue) {
      const obj = {};
      Object.defineProperty(obj, "current", {
        configurable: false,
        writable: true,
        enumerable: true,
        value: initialValue,
      });
      if (!hooks[currentHook]) {
        hooks[currentHook] = obj;
      }
      return hooks[currentHook++];
    },
    useCallback(callback, depArray) {
      const hasNoDeps = !depArray;
      const deps = hooks[currentHook];
      const hasChangedDeps = deps
        ? !depArray.every((el, i) => el === deps[i])
        : true;
      if (hasNoDeps || hasChangedDeps) {
        hooks[currentHook] = callback;
      }
      return hooks[currentHook++];
    },
    useMemo(callback, depArray) {
      const hasNoDeps = !depArray;
      const deps = hooks[currentHook];
      const hasChangedDeps = deps
        ? !depArray.every((el, i) => el === deps[i])
        : true;
      if (hasNoDeps || hasChangedDeps) {
        hooks[currentHook] = callback();
      }
      return hooks[currentHook++];
    },
  };
})();

const Label = () => {
  const [text, setText] = MyReact.useState("elnaz");

  console.log("Label Rendered : " + text);

  MyReact.useEffect(() => {
    setTimeout(() => {
      setText("elham");
    }, 8000);
  }, []);

  return {
    render: () => {},
  };
};

const App = () => {
  const [count, setCount] = MyReact.useState(0);
  const [text, setText] = MyReact.useState("foo"); // 2nd state hook!
  const personData = MyReact.useRef(null);

  if (personData.current) {
    personData.current = { name: "ali", age: 63 };
  }
  if (!personData.current) {
    personData.current = { name: "sina", age: 25 };
  }

  const cb = MyReact.useCallback(
    () => console.log("Hello from useCallback"),
    []
  );
  const memo = MyReact.useMemo(() => text, [text]);

  console.log(text);
  console.log(count);
  console.log(memo);

  MyReact.useEffect(() => {
    const t1 = setTimeout(() => {
      setText("sina");
      clearTimeout(t1);
    }, 3000);

    const t2 = setTimeout(() => {
      setCount((count) => count + 5);
      clearTimeout(t2);
    }, 2000);

    const t3 = setTimeout(() => {
      setCount((count) => count + 25);
      clearTimeout(t3);
    }, 5000);
  }, [text]);

  Label();
};
let Component;
Component = MyReact.render(App);
