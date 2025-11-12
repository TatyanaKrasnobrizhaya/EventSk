import express from "express";
import multer from "multer";
import { authorize } from "../service/Security.js";
import * as Posts from "../service/Posts.js";
// import { addPost } from "../service/Posts.js";
import path from "node:path";
import fs from "node:fs";

const router = express.Router();

// vytvorit adresar pre upload obrazkov ak neexistuje
fs.mkdir(path.resolve("public/images/post"), { recursive: true }, (err) => {
  console.error(err);
});

// podpora pre upload suborov - parsovanie multipart form data);
const upload = multer({ dest: "public/images/post" });

/**
 * Zobrazit vsetky prispevky
 */
const sortOptions = {
  dateASC: "showAllByDateASC",
  dateDESC: "showAllByDateDESC",
  nameASC: "showAllByNameASC",
  nameDESC: "showAllByNameDESC",
};

const actualSortOptions = {
  dateASC: "showActualByDateASC",
  dateDESC: "showActualByDateDESC",
  nameASC: "showActualByNameASC",
  nameDESC: "showActualByNameDESC",
};

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

router.post(
  "/create",
  [authorize("user", "admin"), upload.single("file")],
  async function (req, res) {
    try {
      const postData = {
        userId: req.session.user.id,
        nazov: req.body.name,
        popis: req.body.popis,
        mesto: req.body.mesto,
        date: req.body.datum,
        typ: req.body.udalosti,
        region: req.body.region,
      };

      await Posts.addPost(
        postData.userId,
        postData.nazov,
        postData.popis,
        postData.mesto,
        postData.date,
        postData.typ,
        postData.region,
        req.file.path,
      );

      res.redirect("/");
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).send("Internal Server Error");
    }
  },
);

router.get("/create", async function (req, res) {
  res.render("post/index.twig");
});

/**
 * Vymazat prispevok a prejst na zoznam prispevkov
 */
router.get("/delete/:postId", authorize("admin"), async function (req, res) {
  await Posts.deletePost(req.params.postId);
  await req.flash("success", "Príspevok bol vymazaný.");
  res.redirect("/post");
});

/**
 * Zobrazit formular pre upravu prispevku.
 *
 * Pridavat prispevky moze len prihlaseny pouzivatel s rolou user alebo admin.
 */
router.get(
  "/edit/:postId?",
  authorize("user", "admin"),
  async function (req, res) {
    let postData = {
      id: 0,
      message: "",
    };

    if (req.params.postId) {
      postData = (await Posts.findPost(req.params.postId))[0];
    }

    res.render("post/edit.twig", { post: postData });
  },
);

/**
 * Ulozim prispevok.
 *
 * Pridavat prispevky moze len prihlaseny pouzivatel s rolou user alebo admin.
 * Vsimnime si, ze v tomto pripade pouzijeme dve middleware funckie, ktore zapiseme do pola:
 * - autorizacia pouzivatela
 * - upload suboru
 */
router.post(
  "/edit/:postId?",
  [authorize("user", "admin"), upload.single("obrazok")],
  async function (req, res) {
    try {
      console.log(req.body);
      console.log(req.file.path);
      console.log(req.session.user.id);
      if (req.params.postId) {
        await Posts.updatePost(
          req.session.user.id,
          req.body.nazov,
          req.body.popis,
          req.body.mesto,
          req.body.date,
          req.body.typ,
          req.body.region,
          req.file ? req.file.path : null,
          req.params.postId,
        );
      }

      await req.flash("success", "Пост был успешно обновлен.");

      res.redirect("/post");
    } catch (error) {
      console.error("Ошибка при обновлении поста:", error);
      res.status(500).send("Внутренняя ошибка сервера");
    }
  },
);

router.get(
  "/comments/edit/:postId",
  authorize("user", "admin"),
  async function (req, res) {
    const postId = req.params.postId;

    res.render("comments/create.twig", { postId: postId });
  },
);

router.get("/comments/:postId", async function (req, res) {
  const postId = req.params.postId;
  const comments = await Posts.getCommentsByPostId(postId);

  res.render("comments/index.twig", { comments: comments, postId: postId });
});

router.post(
  "/comments/create/:postId",
  [authorize("user", "admin")],
  async function (req, res) {
    try {
      const postId = req.params.postId;
      const userId = req.session.user.id;
      const commentText = req.body.commentText;

      console.log("userId: " + userId, "postId: " + postId);
      await Posts.addComment(userId, postId, commentText);

      res.redirect(`/post/comments/${postId}`);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).send("Internal Server Error");
    }
  },
);

/**
 * Ziskat obrazok zo subory, ktory patri k prispevku s definovanym ID
 */
router.get("/image/:postId", async (req, res) => {
  let filePath = path.resolve(
    "public/images/post/" + req.params.postId + ".jpg",
  );
  fs.access(filePath, (err) => {
    if (err) {
      res.sendFile(path.resolve("public/images/placeholder.jpg"));
    } else {
      res.sendFile(filePath);
    }
  });
});

/**
 * Hlasovat za prispevok. Po hlasovani sa neobnovy stranka len sa zmeni cislo hodnoteni.
 *
 * Aby som stazil opatovne hodnotenie, pouzivam cookies
 */
router.post("/add_like/:postId", async function (req, res) {
  try {
    let postId = req.params.postId;

    // pokusim sa nacitat zoznam ID z cookie
    let ratings = req.cookies.postRatings;

    // ak rating cookie neexistuje, niekde je problem, lebo pri zobrazovani prispevkov sa ma vytvorit
    if (!ratings) {
      throw new Error("Problém s cookies!");
    }

    if (ratings.includes(postId)) {
      throw new Error("Už ste hlasovali!");
    }

    // zavolam funkciu pre zvysenie hodnotenia. Funkcia vrati novu hodnotu hodnotenia.
    let newRating = await Posts.addLike(postId);

    // pridam medzi hodnotenia ID prispevku, za ktory pouzivatel zahlasoval.
    ratings.push(postId);

    // ulozim novy zoznam ID prispevkov s hodnotenim do cookie
    res.cookie("postRatings", ratings, {
      maxAge: 1000 * 3600 * 24 * 365,
      httpOnly: true,
      sameSite: "strict",
    });

    // vratim informaciu o aktualej hodnote hodnotenia
    res.json({ message: newRating });
  } catch (e) {
    // odoslanie chyboveho hlasenia s HTTP kodom 400 (chyba klienta - napr. pokus o opakovane hlasovanie)
    // prehliadac na strane klienta na zaklade kodu odpovede moze zobrazit chybove hlasenie.
    res.status(400).json({ message: e.message });
  }
});

export { router as PostController };
