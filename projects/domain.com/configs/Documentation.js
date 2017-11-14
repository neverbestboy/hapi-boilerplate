module.exports = {
  active: true,
  options: {
    info: {
      title: 'Default',
      version: '1.0.0'
    },
    grouping: 'tags',
    tags: [
      {
        name: 'Default',
        description: 'Project Default'
      }
    ],
    securityDefinitions: {
      jwt: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      },
      checksum: {
        type: 'apiKey',
        name: 'Checksum',
        in: 'header'
      }
    },
    security: [
      {
        jwt: []
      }
    ]
  }
};
