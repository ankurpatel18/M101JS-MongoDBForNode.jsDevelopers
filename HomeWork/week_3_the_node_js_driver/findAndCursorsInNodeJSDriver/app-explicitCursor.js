var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


MongoClient.connect('mongodb://localhost:27017/crunchdb', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var query = {"category_code": "biotech"};
    var projection = {"category_code":1,"name":1,"_id":0};

    var cursor = db.collection('company').find(query);
    cursor.project(projection);

    cursor.forEach(
        function(doc) {
            console.log( doc.name + " is a " + doc.category_code + " company." );
            console.log( doc);
        },
        function(err) {
            assert.equal(err, null);
            return db.close();
        }
    );

});
