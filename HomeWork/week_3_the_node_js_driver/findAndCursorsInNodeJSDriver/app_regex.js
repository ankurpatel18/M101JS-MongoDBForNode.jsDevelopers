var MongoClient = require('mongodb').MongoClient,
    commandLineArgs = require("command-line-args")
    assert = require('assert');

var options = commandLineOptions();
MongoClient.connect('mongodb://localhost:27017/crunchdb', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var query = queryDocument(options);
    var projection = projectDocument(options);

    var cursor = db.collection('company').find(query);
    cursor.project(projection);

    var numOfMatches = 0;

    cursor.forEach(
        function(doc) {
            numOfMatches++ ;
            console.log(doc);
        },
        function(err) {
            assert.equal(err, null);
            console.log(query);
            console.log(numOfMatches);
            return db.close();
        }
    );
});

function projectDocument(opt){
    var prj = {
        "_id" :0,
        "name" : 1,
        "founded_year" : 1
    };

    if("overview" in opt){
        prj.overview = 1;
    }

    if("milestones" in opt){
        prj["milestones.source_description"] = 1;
    }
    return prj;
}

function queryDocument(opt){
    var query = {};

    if("overview" in opt){
        query.overview = {"$regex" : opt.overview, "$options": "i"};
    }

    if("milestones" in opt){
        query["milestones.source_description"] = {"$regex" : opt.milestones, "$options": "i"};
    }
    return query;
}

function commandLineOptions(){
    var cli = commandLineArgs([
        { name : "overview", alias:"o", type:String},
        { name : "milestones", alias:"m", type:String}
    ]);

    var opt = cli.parse();

    if ((!("overview" in opt)) && (!("milestones" in opt))) {
        console.log(cli.getUsage({
            title:'Usage',
            description: 'you must supply one option'
        }));
        process.exit();
    }

    return opt;
}