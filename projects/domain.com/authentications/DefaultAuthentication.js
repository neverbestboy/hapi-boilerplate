const AuthenticationConfig = require('../configs/Authentication');

module.exports.Apply = (Server, AuthenticationName) => {
  async function AuthorizationValidate(data, request, callback) {
    return callback(null, true, data);
  }

  async function AuthorizationPayloadValidate(request, reply) {
    return reply.continue();
  }
  
  Server.auth.strategy(AuthenticationName, 'jwt', {
    key: AuthenticationConfig.jwtSecretKey,
    validateFunc: AuthorizationValidate,
    validatePayloadFunc: AuthorizationPayloadValidate,
    verifyOptions: {
      algorithms: [
        'HS256'
      ]
    }
  });
};
