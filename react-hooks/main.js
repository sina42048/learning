const MyReact = (function () {
  let hooks = [],
    currentHook = 0; // array of hooks, and an iterator!
  return {
    render(Component) {
      console.log(hooks);
      const Comp = Component(); // run effects
      Comp.render();
      currentHook = 0; // reset for next render
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
      const setState = (newState) => (hooks[setStateHookIndex] = newState);
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
      hooks[currentHook] = obj;
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

function Counter() {
  const [count, setCount] = MyReact.useState(0);
  const [text, setText] = MyReact.useState("foo"); // 2nd state hook!
  const personData = MyReact.useRef({ name: "sina", age: 25 });
  const cb = MyReact.useCallback(
    () => console.log("Hello from useCallback"),
    []
  );
  const memo = MyReact.useMemo(
    () => (text == "bar" ? "memoized changed !" : "memoized"),
    [text]
  );

  MyReact.useEffect(() => {
    console.log("effect", count, text, personData, cb, memo);
  }, [count, text]);
  return {
    click: () => setCount(count + 1),
    type: (txt) => setText(txt),
    noop: () => setCount(count),
    render: () => console.log("render", { count, text }),
  };
}
let App;
App = MyReact.render(Counter);

App.click();
App = MyReact.render(Counter);

App.type("bar");
App = MyReact.render(Counter);
