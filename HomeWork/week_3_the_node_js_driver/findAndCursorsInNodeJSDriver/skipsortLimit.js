var MongoClient = require('mongodb').MongoClient,
    commandLineArgs = require("command-line-args")
    assert = require('assert');

var options = commandLineOptions();
MongoClient.connect('mongodb://localhost:27017/crunchdb', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var query = queryDocument(options);
    var projection = {"founded_year":1,"number_of_employees":1,"name":1,"_id":0};

    var cursor = db.collection('company').find(query);
    cursor.project(projection);
    cursor.sort([["founded_year",1],["number_of_employees",-1]]);
    cursor.skip(options.skip);
    cursor.limit(options.limit);

    var numOfMatches = 0;

    cursor.forEach(
        function(doc) {
            numOfMatches++ ;
            console.log(doc.name);
            console.log("\tfounded " + doc.founded_year);
            console.log("\t" + doc.number_of_employees + " employees");
        },
        function(err) {
            assert.equal(err, null);
            console.log(query);
            console.log(numOfMatches);
            return db.close();
        }
    );
});

function queryDocument(opt){
    var query = {
        "founded_year" : {
            $gte : opt.firstYear,
            $lte : opt.lastYear
        }
    }

    if("employees" in opt){
        query.number_of_employees = {$gte : opt.employees};
    }
    return query;
}

function commandLineOptions(){
    var cli = commandLineArgs([
        { name : "firstYear", alias:"f", type:Number},
        { name : "lastYear", alias:"l", type:Number},
        { name : "employees", alias:"e", type:Number},
        { name : "skip", defaultValue: 0, type:Number},
        { name : "limit", defaultValue: 20000, type:Number}
    ]);

    var opt = cli.parse();

    if (!(("firstYear" in opt) && ("lastYear" in opt))) {
        console.log(cli.getUsage({
            title:'Usage',
            description: 'The first two options are mandatory'
        }));
        process.exit();
    }

    return opt;
}