const extractor = (func) => {
  return (func + "")
    .replace(/[/][/].*$/gm, "") // strip single-line comments
    .replace(/\s+/g, "") // strip white space
    .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments
    .split("){", 1)[0]
    .replace(/^[^(]*[(]/, "") // extract the parameters
    .replace(/=[^,]+/g, "") // strip any ES6 defaults
    .split(",")
    .filter(Boolean); // split & filter [""]
};

const realUsage = (function () {
  const tools = {
    timeout: setTimeout,
    interval: setInterval,
  };

  const isParamToolExist = (paramName) => !!tools[paramName];

  const passToParam = (func) => {
    const extracted = extractor(func);
    const extractedParamsToTools = extracted.map((param) => {
      return isParamToolExist(param) ? tools[param] : undefined;
    });
    func(...extractedParamsToTools);
  };

  return {
    passToParam,
  };
})();

realUsage.passToParam(function (timeout, interval) {
  timeout(() => console.log("passed"), 2000);
  interval(() => console.log("interval passed"), 1000);
});
