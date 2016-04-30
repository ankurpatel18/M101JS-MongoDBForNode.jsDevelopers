mongoimport -d m101 -c profile < sysprofile.json

db.profile.find({ns:/school2.students/}, {_id: 0, millis: 1 } ).sort( { millis: -1 } ).limit(3)