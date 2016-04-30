use store;
db.products.drop();
for (i = 0; i < 100; i++) {
	cat = ['mobile', 'tablet', 'ipad', 'cellphone'];
	brd = ['apple', 'samsung', 'sony'];
	getcat = i%3;
	getbrd = i%2;
	record = {
		'sku':i,
		'price':i*10,
		'description':"prodcuts" + i,
		'category' : cat[getcat],
		'brand' : brd[getbrd],
		'reviews' : {
			'author' : 'author' + (i%4)
		}
	};
	db.products.insert(record);
}



db.products.getIndexes()
db.products.createIndex({sku:1})

db.products.createIndex({price:-1})

db.products.createIndex({description:1})

db.products.createIndex({category:1,brand:1})

db.products.createIndex({'reviews.author':1})


var exp = db.products.explain(true)

exp.find( { 'brand' : "GE" } )
exp.find( { 'brand' : "GE" } ).sort( { price : 1 } )
exp.find( { $and : [ { price : { $gt : 30 } },{ price : { $lt : 50 } } ] } ).sort( { brand : 1 } )
exp.find( { brand : 'GE' } ).sort( { category : 1, brand : -1 } )