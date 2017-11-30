const Private = {
  isAggregation(data) {
    return 'aggregations' in data;
  },
      
  isDelete(data) {
    return '_indices' in data;
  },
      
  isSearch(data) {
    return 'hits' in data;
  }
};
  
const ResultHandlerFactory = {

  parse(data) {
    if (Private.isSearch(data)) {
      if (Private.isAggregation(data)) {
        const aggQuery = require('./AggregationQueryResultHandler');
        aggQuery.create(data);
        return aggQuery;
      } 
      const defaultQuery = require('./DefaultQueryResultHandler');
      defaultQuery.createScheme(data);
      return defaultQuery;
    }

    if (Private.isDelete()) {
      const deleteQuery = require('./DeleteQueryResultHandler');

      deleteQuery.create(data);
      return deleteQuery;
    }

    const showQuery = require('./ShowQueryResultHandler');

    showQuery.create(data);
    return showQuery;
  }
};

module.exports = ResultHandlerFactory;
