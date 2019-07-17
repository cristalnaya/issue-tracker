/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const dotenv = require('dotenv').config();
let expect = require('chai').expect;
let MongoClient = require('mongodb');
let ObjectId = require('mongodb').ObjectID;


const CONNECTION_STRING = process.env.DB;
// MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = (app) => {

  app.route('/api/issues/:project')

    .get((req, res) => {
      let project = req.params.project;
      let query = req.query;
      let obj = {}

      MongoClient.connect(CONNECTION_STRING, (err, client) => {
        for(let property in query) {
          if(property == "open") {
            obj[property] = query[property] == "false" ? false : true;
          } 
          else {
            obj[property] = query[property];  
          } 
        }
          // console.log(`GET database connection error: ${err}`);
          const db = client.db('FCC');
          db.collection('issue-tracker').find(obj).toArray((err, data) => {
            if(err) {
              res.send(err);
            }
            res.send(data);
            client.close();
          })
          console.log('Successfully connected to DB');
      });

    })

    .post((req, res) => {
      var project = req.params.project;
      MongoClient.connect(CONNECTION_STRING, (err, client) => {
        if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
          let issue_title = req.body.issue_title;
          let issue_text = req.body.issue_text;
          let created_by = req.body.created_by;
          let assigned_to = req.body.assigned_to ? req.body.assigned_to : "";
          let status_text = req.body.status_text ? req.body.status_text : "";
          let created_on = new Date();
          let updated_on = new Date();
          let open = true;

          let obj = {
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            created_on,
            updated_on,
            open
          };
        } else {
          res.status(400);
          res.send("Missing one or more required fields");
          client.close();
          return
        }

        client.db("FCC").collection("issue-tracker").insertOne(obj, (err, doc) => {
          if (err) res.send(err);
          else res.send(doc.ops[0]);
          client.close();
        });
      });
    })

    .put((req, res) => {
      MongoClient.connect(CONNECTION_STRING, (err, client) => {
      let project = req.params.project;
      let id = req.body._id;
      let obj = {};
        if (id && Object.keys(req.body).length > 1) {
          for (let prop in req.body) {
            if (prop == "_id") continue;
            if (prop == "open") obj[prop] = req.body[prop] == "false" ? false : true;
            else obj[prop] = req.body[prop];
          }
          obj.updated_on = new Date();
        } else {
          res.status(400);
          res.send("No updated fields sent");
          client.close();
          return;
        }

        client.db("FCC").collection("issue-tracker").updateOne({
          _id: ObjectId(id)
        }, {
          $set: {
            open: false
          }
        }, (err, data) => {
          if (err) {
            res.send(`Could not update ${id} ${err}`);
          }
          else {
            res.send(`Successfully updated ${id}`);
          }
          client.close();
        });
      });

    })

    .delete((req, res) => {
      let project = req.params.project;
      let _id = req.body._id;
      if (!_id) {
        res.status(400);
        res.send('_id error');
        return
      }
      MongoClient.connect(
        CONNECTION_STRING,
        (err, client) => {
          client.db('FCC')
          .collection('issue-tracker')
            .deleteOne({
              _id: ObjectId(req.body._id)
            })
            .then(data => {
              if (!data) {
                return res.send("_id error");
              }
              res.send({
                success: `deleted ${_id}`
              });
            })
            .catch(err => {
              return res.json({
                fail: `could not delete ${_id}`
              });
            });
            client.close();
        })
    });

};
