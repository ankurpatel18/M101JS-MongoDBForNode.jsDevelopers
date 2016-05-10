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


function CartDAO(database) {
    "use strict";

    this.db = database;


    this.getCart = function(userId, callback) {
        "use strict";        
        this.db.collection('cart').find({"userId" : userId}).toArray(function(err, docs) {
            assert.equal(err, null);
            assert.notEqual(docs.length, 0);
            docs.forEach(function(doc) {
                callback(doc);
            });
        });
    }


    this.itemInCart = function(userId, itemId, callback) {
        "use strict";
        this.db.collection("cart").aggregate([
            { $unwind: "$items" },
            {$match: {
                "$and" : [
                    {"userId": userId},
                    {"items._id": itemId}
                ]
            }}
        ]).toArray(function(err,docs) {
            if(docs.length > 0){
                callback(docs[0].items);
            }else{
                callback(null);
            }
        });
    }
    
    this.addItem = function(userId, item, callback) {
        "use strict";
        
        this.db.collection("cart").findOneAndUpdate(
            {userId: userId},
            {"$push": {items: item}},
            {
                upsert: true,
                returnOriginal: false
            },
            function(err, result) {
                assert.equal(null, err);
                callback(result.value);
            });
    };


    this.updateQuantity = function(userId, itemId, quantity, callback) {
        "use strict";
        
        this.db.collection("cart").findOneAndUpdate(
        {
            "$and" : [
                {"userId": userId},
                {"items._id": itemId}
            ]
        },
        ((quantity !== 0) ? { $set: { "items.$.quantity" : quantity } }: { $pull: { "items" : {"_id": itemId } } }),
        { returnOriginal: false },
        function(err, result) {
            assert.equal(null, err);
            callback(result.value);
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
            quantity: 1,
            reviews: []
        };

        return item;
    }

}


module.exports.CartDAO = CartDAO;
