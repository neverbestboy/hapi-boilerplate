const _ = require('lodash');
const Hapi = require('hapi');
const Filehound = require('filehound');
const Path = require('path');
const Fs = require('fs');
const Async = require('async');
const Good = require('good');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('../packages/hapi-swagger');
const Lcfirst = require('lcfirst');
const I18n = require('../packages/hapi-i18n');
const Waterline = require('./Waterline');
const Mongoose = require('./Mongoose');
const Config = require('./Config');

const PROJECTS_PATH = `${__dirname}/../projects/`.replace('/system/../', '/');

const System = {

  projects: {},
  connections: {},

  RequireWithCheckExist: (path) => {
    if (Fs.existsSync(path)) {
      return require(path.replace('.js', ''));
    }
    return false;
  },
  
  Load: async (projectStart = []) => {
    return new Promise((resolve, reject) => {
      let pathProjectList = [];

      if (_.isEmpty(projectStart) === true) {
        pathProjectList = Filehound.create()
                                    .path(PROJECTS_PATH)
                                    .directory()
                                    .depth(0)
                                    .findSync();
      } else {
        _.forEach(projectStart, (v) => {
          pathProjectList.push(
            PROJECTS_PATH + v
          );
        });
      }
      
      Async.forEachOf(pathProjectList, (v, k, callback) => {
        const project = {};
        project.config = {};
        project.basePath = Path.basename(v);
        project.fullPath = v;
        System.projects[project.basePath] = project;
        callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyConfig: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const pathConfigList = Filehound.create()
                                .path(`${PROJECTS_PATH}${project.basePath}/configs`)
                                .ext('.js')
                                .depth(0)
                                .findSync();
        Async.forEachOf(pathConfigList, (pathConfig, key, cb) => {
          Config(System.RequireWithCheckExist(pathConfig), pathConfig);
          return cb();
        }, (err) => {
          if (err) return reject(err);
          return true;
        });    
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  GetInfo: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const generalConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/General.js`);
        if (generalConfig) {
          System.projects[k].title = generalConfig.title;
          System.projects[k].active = generalConfig.active;
        }
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  CreateHapiServer: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const server = new Hapi.Server();

        const pathApp = `${PROJECTS_PATH}${project.basePath}/app.js`;
        const app = System.RequireWithCheckExist(pathApp);
        if (app) {
          System.projects[project.basePath].app = app;
          require.cache[pathApp].exports = project;
        } else {
          return reject('Missing app.js');
        }
        
        const httpConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Http.js`);
        // TODO: Kiểm tra thêm thuộc tính host, port, cors
        if (!httpConfig) {
          return reject(`Không tìm thấy thiết lập HTTP tại dự án ${project.title}`);
        }
        if (httpConfig.active === true) {
          const configConnection = {
            port: httpConfig.port,
            host: httpConfig.host
          };
          if (httpConfig.cors) {
            configConnection.routes = {
              cors: httpConfig.cors
            };
          }
          server.connection(configConnection);
          System.projects[project.basePath].isActiveHttp = true;
        } else {
          System.projects[project.basePath].isActiveHttp = false;
        }

        System.projects[project.basePath].server = server;
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyPluginGood: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const server = project.server;
        const logConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Log.js`);
        if (!logConfig) {
          return reject(`Không tìm thấy thiết lập Log tại dự án ${project.title}`);
        }
        server.register({
          register: Good,
          options: logConfig
        }, (error) => {
          if (error) {
            reject(error);
          }
        });
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyPluginI18n: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const server = project.server;
        const languageConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Language.js`);
        if (!languageConfig) {
          return reject(`Can't found language config at project ${project.title}`);
        }
        if (project.isActiveHttp === false) {
          if (languageConfig.active === true) {
            server.log('warn', `Can't active language when not active http at project ${project.title}`);
          }
          return callback();
        }
        if (languageConfig.active === false) {
          return callback();
        }
        const languageConfigOptions = languageConfig.options;
        languageConfigOptions.directory = `${PROJECTS_PATH}${project.basePath}/locales`;
        server.register({
          register: I18n,
          options: languageConfigOptions
        }, (error) => {
          if (error) {
            reject(error);
          }
        });
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyPluginSwagger: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const server = project.server;
        const docConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Documentation.js`);
        if (!docConfig) {
          return reject(`Không tìm thấy thiết lập Documentation tại dự án ${project.title}`);
        }
        if (project.isActiveHttp === false) {
          if (docConfig.active === true) {
            server.log('warn', `Can't active document when not active http at project ${project.title}`);
          }
          return callback();
        }
        if (docConfig.active === false) {
          return callback();
        }
        server.register([
          Inert,
          Vision,
          {
            register: HapiSwagger,
            options: docConfig.options
          }
        ], (err) => {
          if (err) {
            reject(err);
          }
        });
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyPlugin: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const server = project.server;
        const pluginConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Plugin.js`);
        if (!pluginConfig) {
          return reject(`Không tìm thấy thiết lập Plugin tại dự án ${project.title}`);
        }
        if (project.isActiveHttp === false) {
          if (pluginConfig.active === true) {
            server.log('warn', `Can't active plugin when not active http at project ${project.title}`);
          }
          return callback();
        }
        if (pluginConfig.active === false) {
          return callback();
        }
        server.register(pluginConfig.register, (error) => {
          if (error) {
            reject(error);
          }
        });
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyAuthentication: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const server = project.server;
        const authenticationConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Authentication.js`);
        if (!authenticationConfig) {
          return reject(`Không tìm thấy thiết lập Authentication Config tại dự án ${project.title}`);
        }
        if (project.isActiveHttp === false) {
          if (authenticationConfig.active === true) {
            server.log('warn', `Can't active authentication when not active http at project ${project.title}`);
          }
          return callback();
        }
        if (authenticationConfig.active === false) {
          return callback();
        }
        const pathAuthenticationList = Filehound.create()
                                                .path(`${PROJECTS_PATH}${project.basePath}/authentications`)
                                                .ext('.js')
                                                .glob('*Authentication.js')
                                                .findSync();
        Async.forEachOf(pathAuthenticationList, (pathAuthentication, key, cb) => {  
          const authentication = System.RequireWithCheckExist(pathAuthentication);
          if (_.isFunction(authentication.Apply) === true) {
            authentication.Apply(server, Path.basename(pathAuthentication, 'Authentication.js'));
          }
          return cb();
        }, (err) => {
          if (err) return reject(err);
          if (_.isUndefined(authenticationConfig.default) === false) {
            try {
              server.auth.default(authenticationConfig.default);
            } catch (error) {
              reject(error.message);
            }
          }
          return true;
        });                          
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyRouter: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const server = project.server;
        const routerConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Router.js`);
        if (!routerConfig) {
          return reject(`Không tìm thấy thiết lập Router Config tại dự án ${project.title}`);
        }
        if (project.isActiveHttp === false) {
          if (routerConfig.active === true) {
            server.log('warn', `Can't active router when not active http at project ${project.title}`);
          }
          return callback();
        }
        if (routerConfig.active === false) {
          return callback();
        }
        const pathRouterList = Filehound.create()
                                                .path(`${PROJECTS_PATH}${project.basePath}/routers`)
                                                .ext('.js')
                                                .glob('*Router.js')
                                                .findSync();
        Async.forEachOf(pathRouterList, (pathRouter, key, cb) => {  
          const routers = System.RequireWithCheckExist(pathRouter);
          _.forEach(routers, (router) => {
            try {
              const tmpRouter = router;
              const currentResponseStatus = _.get(tmpRouter, 'config.response.status', false);
              const appendResponseStatus = _.get(routerConfig, 'appendResponseStatus', false);
              const isAppendStatus = _.get(tmpRouter, 'config.response.isAppendStatus', true);
              if (currentResponseStatus && appendResponseStatus) {
                if (isAppendStatus) {
                  tmpRouter.config.response.status = _.merge(currentResponseStatus, appendResponseStatus);
                }
              }
              delete tmpRouter.config.response.isAppendStatus;
              server.route(tmpRouter);
            } catch (errRouter) {
              reject(errRouter.message);
            }
          });
          return cb();
        }, (err) => {
          if (err) return reject(err);
          return true;
        });                          
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyHook: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const server = project.server;
        const hookConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Hook.js`);
        if (!hookConfig) {
          return reject(`Can't found hook config at project ${project.title}`);
        }
        if (project.isActiveHttp === false) {
          if (hookConfig.active === true) {
            server.log('warn', `Can't active hook when not active http at project ${project.title}`);
          }
          return callback();
        }
        if (hookConfig.active === false) {
          return callback();
        }
        const pathHookList = Filehound.create()
                                      .path(`${PROJECTS_PATH}${project.basePath}/hooks`)
                                      .ext('.js')
                                      .glob('*Hook.js')
                                      .findSync();
        Async.forEachOf(pathHookList, (pathHook, key, cb) => {  
          const hook = System.RequireWithCheckExist(pathHook);
          const hookName = Lcfirst(Path.basename(pathHook, 'Hook.js'));
          if (_.indexOf(hookConfig.allows, hookName) > -1) {
            try {
              server.ext(hookName, hook);
            } catch (error) {
              reject(error.message);
            }
          }
          return cb();
        }, (err) => {
          if (err) return reject(err);
          return true;
        });                          
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  StartHapiServer: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        if (project.isActiveHttp === true) {
          const server = project.server;
          server.start((err) => {
            if (err) {
              throw err;
            }
            if (_.isFunction(project.app.Start)) {
              project.app.Start();
            }
            server.log('info', `[${project.title}] Server running at: ${server.info.uri}`);
          });
        }
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyConnection: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, key, callback) => {
        const connectionConfig = System.RequireWithCheckExist(`${PROJECTS_PATH}${project.basePath}/configs/Connection.js`);
        _.forEach(connectionConfig, (v, k) => {
          System.connections[`${project.basePath}-${k}`] = v;
        });
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  ApplyModel: async () => {
    return new Promise(async (resolve, reject) => {
      Async.forEachOf(System.projects, (project, k, callback) => {
        const pathModelList = Filehound.create()
                                        .path(`${PROJECTS_PATH}${project.basePath}/models`)
                                        .ext('.js')
                                        .glob('*Model.js')
                                        .findSync();
        Async.forEachOf(pathModelList, (pathModel, key, cb) => {  
          const model = System.RequireWithCheckExist(pathModel);
          const engine = _.get(System.connections[`${project.basePath}-${model.connection}`], 'engine', false);
          if (engine === 'waterline') {
            Waterline.ApplyModel(model, pathModel, project.basePath);
          } else if (engine === 'mongoose') {
            Mongoose.ApplyModel(model, pathModel, project.basePath);
          }
          return cb();
        }, (err) => {
          if (err) return reject(err);
          return true;
        });   
        return callback();
      }, (err) => {
        if (err) return reject(err);
        return resolve(System.projects);
      });
    });
  },

  StartEngineDb: async () => {
    return new Promise(async (resolve, reject) => {
      await Waterline.Start(System.connections);
      await Mongoose.Start(System.connections);
      resolve(true);
    });
  }

};

module.exports = {
  
  Start: (projectStarted = []) => {
    return new Promise(async (resolve, reject) => {
      Async.waterfall([
        // region Load project list 
        (callback) => {
          System.Load(projectStarted)
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Apply config
        (callback) => {
          System.ApplyConfig()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Get info project
        (callback) => {
          System.GetInfo(projectStarted)
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion
        
        // region Apply Connection
        (callback) => {
          System.ApplyConnection()
          .then(() => {
            callback(null);
          })
          .catch((error) => {
            callback(error);
          });
        },
        // endregion

        // region Apply Model
        (callback) => {
          System.ApplyModel()
          .then(() => {
            callback(null);
          })
          .catch((error) => {
            callback(error);
          });
        },
        // endregion
       
        // region Start Engine Db
        (callback) => {
          System.StartEngineDb()
          .then(() => {
            callback(null);
          })
          .catch((error) => {
            callback(error);
          });
        },
        // endregion
      
        // region Khởi tạo Hapi Server 
        (callback) => {
          System.CreateHapiServer()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Apply plugin Good 
        (callback) => {
          System.ApplyPluginGood()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Apply plugin I18n 
        (callback) => {
          System.ApplyPluginI18n()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Apply plugin Swagger 
        (callback) => {
          System.ApplyPluginSwagger()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Apply plugin
        (callback) => {
          System.ApplyPlugin()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Apply Authentication
        (callback) => {
          System.ApplyAuthentication()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Apply Router
        (callback) => {
          System.ApplyRouter()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Apply Hook
        (callback) => {
          System.ApplyHook()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        },
        // endregion

        // region Start Hapi server
        (callback) => {
          System.StartHapiServer()
            .then(() => {
              callback(null);
            })
            .catch((error) => {
              callback(error);
            });
        }
        // endregion

      ], (err) => {
        if (err) { return reject(err); }
        return resolve(System.projects);
      });
    });
  }
};
