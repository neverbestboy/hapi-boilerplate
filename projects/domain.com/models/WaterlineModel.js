module.exports = {
  connection: 'default',
  tableName: 'Waterline',
  attributes: {
    title: {
      type: 'string',
      required: true
    },
    status: {
      type: 'boolean',
      defaultsTo: true
    }
  }
};
