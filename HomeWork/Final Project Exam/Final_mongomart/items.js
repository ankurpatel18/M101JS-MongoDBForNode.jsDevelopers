/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";

        this.db.collection('item').aggregate( [
            { $group: {
                _id: '$category',
                num: { $sum: 1 }
            } },
            { $sort: { _id: 1 } }
        ] ).toArray(function(err, docs) {

            assert.equal(err, null);
            assert.notEqual(docs.length, 0);

           var no =0;
            docs.forEach(function(doc){
                no = no + doc.num;        
            });
            

            var category = {
                _id: "All",
                num: no
            };
            docs.unshift(category);
            callback(docs);
        });        
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        if(category === "All")
        {
            var query = [
                { $sort : {_id : 1}},
                { $skip : page * itemsPerPage },
                { $limit : itemsPerPage }
            ];
        }else{
            query = [
                { $match: {'category' : category} },
                { $sort : {_id : 1}},
                { $skip : page * itemsPerPage },
                { $limit : itemsPerPage }
            ];
        }
        this.db.collection('item').aggregate(query).toArray(function(err, docs) {

            assert.equal(err, null);
            assert.notEqual(docs.length, 0);
            callback(docs);
        });

        
    }


    this.getNumItems = function(category, callback) {
        "use strict";

        if(category === "All")
        {
            var query = {}; 
        }else{
            query = {'category' : category};
        }
        this.db.collection('item').find(query).count(function(err,  count) {

            assert.equal(err, null);
            assert.notEqual(count, 0);
            callback(count);
        });

        
    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        var queryObj = [
            { $match: { "$or" : [
                {'title' : {"$regex" : query, "$options": "i"} },
                {'slogan' : {"$regex" : query, "$options": "i"} },
                {'description' : {"$regex" : query, "$options": "i"} }
            ]}},
            { $sort : {_id : 1}},
            { $skip : page * itemsPerPage },
            { $limit : itemsPerPage }
        ];
        this.db.collection('item').aggregate(queryObj).toArray(function(err, docs) {

            assert.equal(err, null);
            assert.notEqual(docs.length, 0);
            var items = [];
            docs.forEach(function(doc) {
                items.push(doc);
            });

            callback(items);
        });
        
    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var queryObj = { "$or" : [
            {'title' : {"$regex" : query, "$options": "i"} },
            {'slogan' : {"$regex" : query, "$options": "i"} },
            {'description' : {"$regex" : query, "$options": "i"} }
        ]};
        this.db.collection('item').find(queryObj).count(function(err,  count) {

            assert.equal(err, null);
            assert.notEqual(count, 0);
            callback(count);
        });
    }


    this.getItem = function(itemId, callback) {
        "use strict";

        this.db.collection('item').find({'_id': itemId}).forEach(function(doc) { 
            callback(doc);
        });
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        };

        this.db.collection("item").updateOne({_id: itemId},{ $push: { "reviews" : reviewDoc }}, function(err, result) {
            assert.equal(err, null);
            callback(result);
        });
    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
