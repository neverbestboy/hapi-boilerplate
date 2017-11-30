/* DefaultQueryResultHandler object 
 Handle the query result,
 in case of regular query
 (Not aggregation)
 */
let DefaultQueryResultHandler = {

    data: null,
    head: null,
	
	// createScheme by traverse hits field
    createScheme: function (data) {
		this.data = data;
		
        let hits = data.hits.hits;
        let scheme = [];

        for (let index = 0; index < hits.length; index++) {
            let hit = hits[index];

            for (let key in hit._source) {
                if (scheme.indexOf(key) == -1) {
                    scheme.push(key)
               }
            }

            for (let key in hit.fields) {
                if (scheme.indexOf(key) == -1) {
                    scheme.push(key)
               }
            }
        }

        return (this.head = scheme);
    },

    isScroll: function (){
		let scrollId = this.getScrollId();
		
		if (scrollId && scrollId != '') {
			return true;
		}
		
		return false;
	},
	
	getBody: function () {
		let hits = this.data.hits.hits;
		let body = [];

		for (let i = 0; i < hits.length; i++) {
			let row = hits[i]._source;

			//if ("fields" in hits[i]) {
			//	Private.addFieldsToRow(row, hits[i])
			//}

			//if (this.isFlat) {
			//	row = Private.flatRow(this.head, row);
			//}

			//if (this.showType) {
			//	row["_type"] = hits[i]._type
			//}

			//if (this.showScore) {
			//	row["_score"] = hits[i]._score
			//}

			//if (this.showId) {
				row["_id"] = hits[i]._id
			//}

			body.push(row);
		}

		return body;
	},
	
	getCurrentHitsSize: function () {
		return this.data.hits.hits.length;
	},
	
	getHead: function () {
		return this.head
	},
	
	getScrollId: function () {
		return this.data["_scroll_id"];
	},

	getTotal: function () {
		return this.data.hits.total;
	}
};

let Private = {
	addFieldsToRow: function (row, hit) {
		for (field in hit.fields) {
			fieldValue = hit.fields[field];

			if (fieldValue instanceof Array) {
				if (fieldValue.length > 1) {
					row[field] = fieldValue;
				} else {
					row[field] = fieldValue[0];
				}
			} else {
				row[field] = fieldValue;
			}
		}
	},

	findKeysRecursive: function (scheme, keys, prefix) {
		for (key in keys) {
			if (typeof (keys[key]) == "object" && (!(keys[key] instanceof Array))) {
				Private.findKeysRecursive(scheme, keys[key], prefix + key + ".")
			} else {
				if (scheme.indexOf(prefix + key) == -1) {
					scheme.push(prefix + key);
				}
			}
		}
	},

	flatRow: function (keys, row) {
		let flattenRow = {}

		for (i = 0 ; i < keys.length ; i++) {
			key = keys[i];
			splittedKey = key.split(".");

			let found = true;

			currentObj = row;

			for (j = 0 ; j < splittedKey.length ; j++) {
				if (currentObj[splittedKey[j]] == undefined) {
					found = false;
					break;
				} else {
					currentObj = currentObj[splittedKey[j]];
				}
			}

			if (found) {
				flattenRow[key] = currentObj;
			}
		}

		return flattenRow;
	},

	removeNestedAndFilters: function (aggs) {
		for (field in aggs) {
			if (field.endsWith("@NESTED") || field.endsWith("@FILTER") || field.endsWith("@NESTED_REVERSED") || field.endsWith("@CHILDREN")) {
				delete aggs[field]["doc_count"];
				delete aggs[field]["key"];
				leftField = Object.keys(aggs[field])[0];
				aggs[leftField] = aggs[field][leftField];
				delete aggs[field];
				Private.removeNestedAndFilters(aggs);
			}

			if (typeof (aggs[field]) == "object") {
				Private.removeNestedAndFilters(aggs[field]);
			}
		}
	}
};

module.exports = DefaultQueryResultHandler;