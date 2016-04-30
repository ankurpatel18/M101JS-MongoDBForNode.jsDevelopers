mongoimport -d m101 -c profile < sysprofile.json

db.profile.find({ns:/school2.students/}).sort({millis:-1}).pretty()