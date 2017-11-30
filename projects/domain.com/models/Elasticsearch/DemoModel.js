module.exports = {
  connection: 'elasticsearch',
  async getDemo() {
    const data = await this.querySql('SELECT * FROM xxx/aaa');
    console.dir(data);
  }
};

