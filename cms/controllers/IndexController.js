import express from "express";
import { authorize } from "../service/Security.js";
import * as Posts from "../service/Posts.js";

const router = express.Router();

/**
 * Uvodna stranka
 */
router.get("/", async function (req, res) {
  let posts;

  let sortBy = req.query.sortBy;
  console.log(req.query.sortBy);
  let filterBy = req.query.filterBy;
  if (sortBy === undefined) {
    posts = await Posts.findAllPosts();
  } else {
    posts = await Posts.sortedMethod(sortBy, filterBy);
  }
  console.log(posts);
  res.render("index/form.twig", {
    posts: posts,
  });
});

/**
 * Zobraznie formulara
 */
router.get("/form", function (req, res, next) {
  res.render("index/form.twig");
});

/**
 * Spracovanie dat z odoslaneho formulara.
 */
router.post("/form", async function (req, res) {
  console.log(req.body);
  await req.flash("success", JSON.stringify(req.body));
  res.redirect("/form");
});

/**
 * Stranka s obmedzenym pristupom. Vyzaduje sa rola admin.
 */
router.get("/admin", authorize("admin"), function (req, res) {
  res.render("index/admin.twig");
});

export { router as IndexController };
