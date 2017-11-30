/* ShowQueryResultHandler object
 for showing mapping in some levels (cluster, index and types)
 */
let ShowQueryResultHandler = {
	create: function (data) {
		let mappingParser = new MappingParser(data);
		let indices = mappingParser.getIndices();

		body = [];

		if (indices.length > 1) {
			this.head = ["index", "types"];

			for (indexOfIndex in indices) {
				let indexToTypes = {};
				let index = indices[indexOfIndex];

				indexToTypes["index"] = index;
				indexToTypes["types"] = mappingParser.getTypes(index);

				body.push(indexToTypes);
			}
		} else {
			let index = indices[0];
			let types = mappingParser.getTypes(index);

			if (types.length > 1) {
				this.head = ["type", "fields"];

				for (typeIndex in types) {
					let typeToFields = {};
					let type = types[typeIndex];

					typeToFields["type"] = type;
					typeToFields["fields"] = mappingParser.getFieldsForType(index, type);

					body.push(typeToFields);
				}
			} else {
				this.head = ["field", "type"];

				anyFieldContainsMore = false;
				fieldsWithMapping = mappingParser.getFieldsForTypeWithMapping(index, types[0]);

				for (field in fieldsWithMapping) {
					fieldRow = {};
					fieldMapping = fieldsWithMapping[field];
					fieldRow["field"] = field;
					fieldRow["type"] = fieldMapping["type"];
					delete fieldMapping["type"];
					if (!$.isEmptyObject(fieldMapping)) {
						anyFieldContainsMore = true;
						fieldRow["more"] = fieldMapping;
					}

					body.push(fieldRow);
				}

				if (anyFieldContainsMore) {
					this.head.push("more");
				}
			}
		}

		this.body = body;
	},
	
	getBody: function () {
		return this.body;
	},
	
	getCurrentHitsSize: function () {
		return this.body.length;
	},
	
	getHead: function () {
		return this.head;
	},
	
	getTotal: function () {
		return this.body.length;
	}
};

module.exports = ShowQueryResultHandler;