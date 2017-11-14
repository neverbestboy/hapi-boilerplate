const System = require('./system/System');

(async () => {
  try {
    await System.Start();
  } catch (error) {
    console.log(error);
  }
})();
