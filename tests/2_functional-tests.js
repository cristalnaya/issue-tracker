/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

let chaiHttp = require('chai-http');
let chai = require('chai');
let assert = chai.assert;
let server = require('../server');
let MongoClient = require('mongodb').MongoClient;


chai.use(chaiHttp);

suite('Functional Tests', function () {

  suite('POST /api/issues/{project} => object with issue data', function () {
    suiteTeardown((done) => {
      MongoClient.connect(process.env.DB, (err, client) => {
        client.db('FCC').collection('issue-tracker').deleteMany({
          created_by: 'Functional Test - Posting issues'
        }, (err, doc) => {
          client.close()
        })
      });
      done();
    });

    test('Every field filled in', (done) => {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end((err, res) => {
          if (err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title')
          assert.equal(res.body.issue_text, 'text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
          assert.equal(res.body.assigned_to, 'Chai and Mocha')
          assert.equal(res.body.status_text, 'In QA')
          assert.property(res.body, 'created_on')
          assert.property(res.body, 'updated_on')
          assert.property(res.body, '_id')
         
          done();
        });
    });

    test('Required fields filled in', (done) => {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title')
          assert.equal(res.body.issue_text, 'text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
          assert.property(res.body, '_id');
          done();
        })
    });

    test('Missing required fields', (done) => {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_text: 'text',
          created_by: 'Functional Test - Missing required fields',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'Missing one or more required fields')
          done();
        })
    });

  });

  suite('PUT /api/issues/{project} => text', function () {
    let id = "5d2dfe0686568879fc2ac02a";
    suiteSetup(function (done) {
      MongoClient.connect(process.env.DB, function (err, client) {
        client.db("FCC").collection("issue-tracker").insertOne({
          _id: id,
          "issue_title": "PUT Test",
          "issue_text": "text",
          "created_by": "Functional Test - Modifying issues",
          "assigned_to": "Chai and Mocha",
          "status_text": "In QA"
        }, (err, doc) => {
          client.close();
        });
      });
      done();
    });

    suiteTeardown((done) => {
      MongoClient.connect(process.env.DB, (err, client) => {
        client.db("FCC").collection("issue-tracker").deleteOne({
          _id: id
        }, (err, data) => {
          client.close();
        });
      });
      done();
    });

    test('No body', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({

        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'Missing one or more required fields')
          done();
        })
    });

    test('One field to update', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'updated title',
          issue_text: 'one field to update'
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'Missing one or more required fields')
          done();
        })
    });

    test('Multiple fields to update', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send()
        .end((err, res) => {
          chai.request(server)
            .put('/api/issues/test')
            .send({
              _id: res.body._id,
              issue_title: 'updated title',
              issue_text: 'modified text'
            })
          assert.equal(res.status, 400);
          assert.equal(res.text, 'Missing one or more required fields')
          done();
        })
    });

  });

  suite('GET /api/issues/{project} => Array of objects with issue data', function () {

    test('No filter', (done) => {
      chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('One filter', (done) => {
      chai.request(server)
        .get('/api/issues/test')
        .query({
          created_by: 'Jane'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0].created_by, 'Jane');
          done();
        })
    });

    test('Multiple filters (test for multiple fields you know will be in the db for a return)', (done) => {
      chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'assigned_to')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          assert.equal('In QA', res.body[0].status_text)
          assert.equal('Chai and Mocha', res.body[0].assigned_to)
          done();
        });
    });

  });

  suite('DELETE /api/issues/{project} => text', function () {
    let id = undefined;

    test('No _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.text, '_id error');
          done();
        });
    });

    test('Valid _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: id
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(id);
          done();
        });
    });

  });

});
