module.exports = {
  reporters: {
    console: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [
          {
            log: { include: '*', exclude: ['SystemErrorTracking'] }
          }
        ]
      },
      {
        module: 'good-console'
      },
      'stdout'
    ],
    file: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [
          {
            response: { include: ['api'], exclude: [] },
            log: { include: '*', exclude: [] }
          }
        ]
      },
      {
        module: 'good-squeeze',
        name: 'SafeJson'
      },
      {
        module: 'good-file',
        args: ['./logs/domain.com.log']
      }
    ]
  },
  includes: {
    request: ['payload'],
    response: ['payload']
  }
};
