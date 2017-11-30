let $ = require('lodash');

let AggregationQueryResultHandler = {
    
	data: null,
	
	create: function (data) {
		this.data = data;
		
        Private.removeNestedAndFilters(data.aggregations);
	},
	
	flattenBuckets: function () {
		return Private.getRows([], undefined, this.data.aggregations, {});
	},
	
	getBody:function () {
		return this.flattenBuckets();
	},
	
	getCurrentHitsSize: function () {
		return this.flattenBuckets().length;
	},
	
	getHead: function () {
		let head = [];
		
		let arr = this.flattenBuckets();
		
		for (let i = 0; i < arr.length; i++) {
			let keys = Object.keys(arr[i]);

			for (let j = 0; j < keys.length; j++) {
				if ($.inArray(keys[j], head) == -1) {
					head.push(keys[j])
				}
			}
		}

		return head;
	},
	
	getTotal: function () {
		return undefined;
	}
};

let Private = {

    fillFieldsForSpecificAggregation: function (obj, value, field) {
        for (key in value) {
            if (key == "values") {
                Private.fillFieldsForSpecificAggregation(obj, value[key], field);
            } else {
                //obj[field + "." + key] = value[key];
                obj[field] = value[key];
            }
        }
		
        return;
    },

    getRows: function (rows, bucketName, bucket, additionalColumns) {
        let subBuckets = Private.getSubBuckets(bucket);

        if (subBuckets.length > 0) {
            for (let i = 0; i < subBuckets.length; i++) {
                let subBucketName = subBuckets[i]["bucketName"];
                let subBucket = subBuckets[i]["bucket"];

                let newAdditionalColumns = {};

                // bucket without parents.
                if (bucketName != undefined) {
                    let newColumn = {};
                    newColumn[bucketName] = bucket.key;
                    newAdditionalColumns = $.extend(newColumn, additionalColumns);
                }

                let newRows = Private.getRows(rows, subBucketName, subBucket, newAdditionalColumns);
                $.merge(rows, newRows);
            }
        } else {
            let obj = $.extend({}, additionalColumns)
            if (bucketName != undefined) {
                if (bucketName != undefined) {
                    if ("key_as_string" in bucket) {
                        obj[bucketName] = bucket["key_as_string"]
                    } else {
                        obj[bucketName] = bucket.key
                    }

                    if (obj[bucketName] == undefined) {
                        obj = undefined;
                    }
                }
            }
            
            for (let field in bucket) {
                let bucketValue = bucket[field];

                if (bucketValue.buckets != undefined) {
                    let newRows = Private.getRows(rows, field, bucketValue.buckets, additionalColumns);
                    $.merge(rows, newRows);
                    continue;
                }

                if (bucketValue.value != undefined) {
                    if ("value_as_string" in bucket[field]) {
                        obj[field] = bucketValue["value_as_string"]
                    } else {
                        obj[field] = bucketValue.value
                    }
                } else {
                    if (typeof (bucketValue) == "object") {
                        /*subBuckets = Private.getSubBuckets(bucketValue);
                        if(subBuckets.length >0){
                             let newRows = Private.getRows(rows, subBucketName, {"buckets":subBuckets}, newAdditionalColumns);
                            $.merge(rows, newRows);
                            continue;
                        }*/

                        Private.fillFieldsForSpecificAggregation(obj, bucketValue, field);
                    }
                }
            }
            
            if (!$.isUndefined(obj) && !$.isEmpty(obj)) {
                rows.push(obj);
            }
        }

        return rows;
    },

    getSubBuckets: function (bucket) {
        let subBuckets = [];

        for (let field in bucket) {
            let buckets = bucket[field].buckets;

            if (buckets != undefined) {
                for (let i = 0; i < buckets.length; i++) {
                    subBuckets.push({ "bucketName": field, "bucket": buckets[i] })
                }
            } else {
                let innerAgg = bucket[field];

                for (let innerField in innerAgg) {
                    if (typeof (innerAgg[innerField]) == "object") {
                        innerBuckets = Private.getSubBuckets(innerAgg[innerField]);
                        $.merge(subBuckets, innerBuckets);
                    }
                }
            }
        }

        return subBuckets;
    },
	
	removeNestedAndFilters: function (aggs) {
		for (let field in aggs) {
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

module.exports = AggregationQueryResultHandler;