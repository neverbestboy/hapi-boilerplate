module.exports = {
  connection: 'default',
  tableName: 'Connections',
  attributes: {
    title: {
      type: 'string',
      required: true
    },
    partnerId: {
      required: true
    },
    status: {
      type: 'boolean',
      default: true
    },
    secretKey: {
      type: 'string',
      required: true
    }
  }
};
