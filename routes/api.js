/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

// Cannot read DATABASE from env file
const DATABASE = "mongodb://alex:alex1995@freecodecamp-shard-00-00-w89rl.gcp.mongodb.net:27017,freecodecamp-shard-00-01-w89rl.gcp.mongodb.net:27017,freecodecamp-shard-00-02-w89rl.gcp.mongodb.net:27017/test?ssl=true&replicaSet=FreeCodeCamp-shard-0&authSource=admin&retryWrites=true&w=majority"

module.exports = function (app) {
    
    app.route('/api/books')
      .get(function (req, res){
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        MongoClient.connect(DATABASE, (err, db) => {
          if(err) {
            console.log('Database error: ' + err);
            return
          }
          db.collection('books').find({ }).toArray(
            (error, response) => {
             if(error) {
               res.status(400).send('Error while searching')
               console.log("error")
                return
             } else {
               response.forEach((book) => { 
                 if(book.commentcount)
                   book.commentcount = book.comments.length
                 else
                   book.commentcount = 0
                 delete book.comments
               })
               res.json(response)
                return
             }
           }
          )
        })
      })

      .post(function (req, res){
        var title = req.body.title;
        /*if(title == '') {
          res.status(200).send('Error, insert title')
          return
        }*/
        MongoClient.connect(DATABASE, (err, db) => {
          if(err) {
            console.log('Database error: ' + err);
            return
          }
          if(!req.body.title) {
            res.status(200).send('Error, insert title')
                return
          }
          db.collection('books').insert(
            { title: req.body.title, comments: []},
            (error, response) => {
             if(error) {
               res.status(400).send('Error while inserting')
               console.log("error")
             } else {
               res.json(response.ops[0])
                return
             }
           }
          )
        })
        //response will contain new book object including atleast _id and title
      })

      .delete(function(req, res){
        //if successful response will be 'complete delete successful'
        MongoClient.connect(DATABASE, (err, db) => {
          if(err) {
            console.log('Database error: ' + err);
            return
          }
          db.collection('books').remove()
          res.status(200).send("complete delete successful");
        })
      });



    app.route('/api/books/:id')
      .get(function (req, res){
        var bookid = req.params.id;
        if(bookid.length != 24) {
          res.status(200).send('Could not find book')
          return
        }
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        MongoClient.connect(DATABASE, (err, db) => {
          if(err) {
            console.log('Database error: ' + err);
            return
          }
          db.collection('books').findOne( { _id: new ObjectId(bookid) }, (error, res2) => {
            if(error) {
              console.log('Error: ' + err);
              return
            }
            if(res2 == null) {
              res.status(200).send('Could not find book')
              return
            }
            res.json(res2)
          })
        })
      })

      .post(function(req, res){
        var bookid = req.params.id;
        var comment = req.body.comment;
        console.log(bookid)
        console.log(comment)
        if(bookid.length != 24) {
            res.status(400).send('Error in ID')
            return
        }
        //json res format same as .get
        MongoClient.connect(DATABASE, (err, db) => {
          if(err) {
            console.log('Database error: ' + err);
            return
          }
          db.collection('books').findAndModify(
            {
              _id: new ObjectId(bookid)
           }, { }, { $push: {comments: comment}}, {new: true, upsert: false}, (error, response) => {
            if(error) {
              res.status(400).send('could not update ' + req.body._id)
              return
            } else {
              
              res.json(response.value)
              return
            }
           })
        })
      })

      .delete(function(req, res){
        var bookid = req.params.id;
        //if successful response will be 'delete successful'
        MongoClient.connect(DATABASE, (err, db) => {
          if(err) {
            console.log('Database error: ' + err);
            return
          }
          db.collection('books').findOneAndDelete({ _id: new ObjectId(bookid)}, (error, result) => {
            if(error) {
              res.status(400).send('could not delete ' + req.body._id)
              return
            } else {
              res.status(200).send('delete successful')
              return
            }
          })
        })
      });

}