async function data(v) {
  console.log(`Data${v}`);
  return `Data${v}`;
}
async function wrap(data) {
  // const result = await data();
  console.log(result);
}

(async () => {
  await wrap(data('ffff'));
})();

