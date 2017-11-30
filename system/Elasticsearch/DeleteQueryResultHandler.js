/* DeleteQueryResultHandler object
 to show delete result status
 */
let DeleteQueryResultHandler = {
    head: ["index_deleted_from", "shards_successful", "shards_failed"],

    body: null,
	
	create: function (data) {
		this.head = ["index_deleted_from", "shards_successful", "shards_failed"];

		let body = [];

		deleteData = data["_indices"];

		for (index in deleteData) {
			deleteStat = {};
			deleteStat["index_deleted_from"] = index;
			shardsData = deleteData[index]["_shards"];
			deleteStat["shards_successful"] = shardsData["successful"];
			deleteStat["shards_failed"] = shardsData["failed"];
			body.push(deleteStat);
		}

		this.body = body;
	},
	
	getBody: function () {
		return this.body;
	},
	
	getCurrentHitsSize: function () {
		return 1;
	},

	getHead: function () {
		return this.head;
	},
	
	getTotal: function () {
		return 1;
	}
};

module.exports = DeleteQueryResultHandler;