var MongoClient = require('mongodb').MongoClient,
    Twitter = require('twitter'),
    assert = require('assert');


require('dotenv').load();
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


MongoClient.connect('mongodb://localhost:27017/social', function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    var screenNames = ["Marvel", "DCComics", "TheRealStanLee"];
    var done = 0;

    screenNames.forEach(function(name) {

        var cursor = db.collection("statuses").find({"user.screen_name": name});
        cursor.sort({ "id": -1 });
        cursor.limit(1);

        cursor.toArray(function(err, docs) {
            assert.equal(err, null);
            
            var params;
            if (docs.length == 1) {
                params = { "screen_name": name, "since_id": docs[0].id, "count": 10 };
            } else {
                params = { "screen_name": name, "count": 10 };
            }
            
            client.get('statuses/user_timeline', params, function(err, statuses, response) {
                
                assert.equal(err, null);
                
                db.collection("statuses").insertMany(statuses, function(err, res) {

                    console.log(res);
                    
                    done += 1;
                    if (done == screenNames.length) {
                        db.close();
                    }
                    
                });
            });
        })
    });
});               
    

