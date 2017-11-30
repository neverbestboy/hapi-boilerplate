const Request = require('request');
const _ = require('lodash');

module.exports.Post = (url, payload = null, options = {}) => {
  return new Promise((resolve, reject) => {
    const infor = {
      url,
      headers: {
        'content-type': 'application/json'
      },
      body: payload,
      forever: true
    };
    if (_.isUndefined(options.auth) === false) {
      infor.auth = {
        user: options.auth.username,
        pass: options.auth.password
      };
    }
    if (_.isUndefined(options.timeout) === false) {
      infor.timeout = options.timeout;
    } else {
      infor.timeout = 30000;
    }
    Request.post(infor, (err, httpResponse, body) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          body,
          response: httpResponse,
          statusCode: httpResponse.statusCode
        });
      }
    });
  });
};

module.exports.Get = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const infor = {
      url,
      headers: {
        'content-type': 'application/json'
      },
      forever: true
    };
    if (_.isUndefined(options.auth) === false) {
      infor.auth = {
        user: options.auth.username,
        pass: options.auth.password
      };
    }
    
    if (_.isUndefined(options.timeout) === false) {
      infor.timeout = options.timeout;
    } else {
      infor.timeout = 30000;
    }

    Request.get(infor, (err, httpResponse, body) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          body,
          response: httpResponse,
          statusCode: httpResponse.statusCode
        });
      }
    });
  });
};
