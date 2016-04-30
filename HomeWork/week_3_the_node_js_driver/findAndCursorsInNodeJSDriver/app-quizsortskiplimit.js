var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


MongoClient.connect('mongodb://localhost:27017/HW3_2', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var cursor = db.collection("grades").find({});
cursor.skip(6);
cursor.limit(2);
cursor.sort({"grade": 1});

    /* TODO: Write your line of code here. */

    cursor.toArray(function(err, docs) {
        
        assert.equal(err, null);
        assert.notEqual(docs.length, 0);
        console.log(docs);
        db.close();
        
    });

});