const express = require("express");
const db = require("../data/database");

const root = express.Router();

root.get("/", function (req, res) {
  res.redirect("/posts");
});

root.get("/posts", async function (req, res) {
  const query = `select posts.*, authors.name as author_name from posts inner join authors on posts.author_id = authors.id`;

  const [posts] = await db.query(query);

  res.render("posts-list", { posts: posts });
});

root.post("/posts", async function (req, res) {
  const query = `insert into posts (title, summary, body, author_id) values (?)`;

  const inputData = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];

  await db.query(query, [inputData]);

  res.redirect("/posts");
});

root.get("/new-post", async function (req, res) {
  const query = `select * from authors`;

  const [authors] = await db.query(query);

  res.render("create-post", { authors: authors });
});

root.get("/posts/:id", async function (req, res) {
  const query = `select posts.*, authors.name as author_name, authors.email as author_email from posts 
    inner join authors on posts.author_id = authors.id 
    where posts.id = ?`;

  const [posts] = await db.query(query, [req.params.id]);

  const postInput = {
    ...posts[0],
    date: posts[0].date.toISOString(),
    humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  res.render("post-detail", { post: postInput });
});

root.get("/posts/edit/:id", async function (req, res) {
  const query = `select posts.* from posts where posts.id = ?`;

  const [posts] = await db.query(query, [req.params.id]);

  res.render("update-post", { post: posts[0] });
});

root.post("/posts/edit/:id", async function (req, res) {
  const query = `update posts set posts.title = ?, posts.summary = ?, posts.body = ? where posts.id = ?`;

  await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);

  res.redirect("/posts");
});

root.post("/posts/delete/:id", async function (req, res) {
  const query = `delete from posts where posts.id = ?`;

  await db.query(query, [req.params.id]);

  res.redirect('/posts');
});

module.exports = root;
