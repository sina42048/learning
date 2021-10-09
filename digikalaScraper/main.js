const cheerio = require("cheerio");
const fs = require("fs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(args));

(async function () {
  const searchInput = process.argv[2];
  const digikala = await fetch(
    "https://www.digikala.com/search/?q=" + searchInput
  ).then((response) => response.text());
  const $ = cheerio.load(digikala);
  const products = $(".c-listing__items.js-plp-products-list")[0].children;
  const fileName = `data-${searchInput}.txt`;
  await promisifyAppendFile(fileName, "[\n", () => {});
  for (product of products) {
    const parseProductToJson = JSON.parse(
      product.children[0].attribs["data-enhanced-ecommerce"]
    );
    const itemName = parseProductToJson.name;
    const itemPrice = parseProductToJson.price;
    const itemBrand = parseProductToJson.brand;
    const jsonData = {
      itemName,
      itemPrice: itemPrice + " تومان",
      itemBrand,
    };
    await promisifyAppendFile(
      fileName,
      JSON.stringify(jsonData) + ",\n",
      () => {}
    );
  }
  await promisifyAppendFile(fileName, "]", () => {});
  console.log(`data extracted from digikala and write to ${fileName}`);
})();

function promisifyAppendFile(fileName, data, callback) {
  return new Promise((res, rej) => {
    fs.appendFile(fileName, data, (err) => {
      if (err) {
        rej(err);
      }
      callback();
      res();
    });
  });
}
