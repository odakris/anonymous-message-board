const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let thread_id_test = "";
  let reply_id_test = "";

  test("Creating a new thread: POST request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({
        text: "Thread",
        delete_password: "password",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        expect(res).to.redirect;
        done();
      });
  });

  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .get("/api/threads/test")
      .set("content-type", "application/json")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        assert.isObject(res.body[0]);
        assert.property(res.body[0], "board");
        assert.property(res.body[0], "text");
        assert.property(res.body[0], "created_on");
        assert.property(res.body[0], "bumped_on");
        assert.property(res.body[0], "replies");
        assert.isArray(res.body[0].replies);
        assert.isAtMost(res.body[0].replies.length, 3);

        thread_id_test = res.body[0]._id;

        done();
      });
  });

  test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .post("/api/replies/test")
      .send({
        board: "test",
        thread_id: thread_id_test,
        text: "reply",
        delete_password: "reply_password",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        expect(res).to.redirect;
        done();
      });
  });

  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .get("/api/replies/test?thread_id=" + thread_id_test)
      .set("content-type", "application/json")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        // assert.equal(res.body.length, 1);
        assert.isArray(res.body.replies);
        assert.property(res.body.replies[0], "text");
        assert.property(res.body.replies[0], "created_on");
        reply_id_test = res.body.replies[0];
        done();
      });
  });

  test("Reporting a thread: PUT request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .put("/api/threads/test")
      .set("content-type", "application/json")
      .send({
        thread_id: thread_id_test,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("Reporting a reply: PUT request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .put("/api/replies/test")
      .set("content-type", "application/json")
      .send({
        thread_id: thread_id_test,
        reply_id: reply_id_test,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({
        thread_id: thread_id_test,
        delete_password: "wrongpassword",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: thread_id_test,
        reply_id: reply_id_test,
        delete_password: "wrongpassword",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: thread_id_test,
        reply_id: reply_id_test,
        delete_password: "reply_password",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });

  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({
        thread_id: thread_id_test,
        delete_password: "password",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });
});
