import express from "express";
import * as Security from "../service/Security.js";
import { authenticate, authorize } from "../service/Security.js";

const router = express.Router();

/**
 * Zobrazit formular pre zadanie mena a hesla
 */
router.get("/login", function (req, res) {
  res.render("user/form.twig");
});

/**
 * Zobrazit formular pre zmenu a hesla
 */
router.get("/passwd", function (req, res) {
  res.render("user/passwd.twig");
});

router.post("/passwd", async function (req, res) {
  try {
    const newPassword = req.body.password1;

    if (!req.session.user) {
      await req.flash("error", "Пользователь не аутентифицирован!");
      return res.redirect("/user/login");
    }

    await Security.setUserPassword(req.session.user.username, newPassword);

    await req.flash("success", "Пароль успешно изменен.");

    res.redirect("/");
  } catch (error) {
    console.error("Ошибка при смене пароля:", error);
    await req.flash("error", "Внутренняя ошибка сервера");
    res.redirect("/");
  }
});

/**
 * Kontrola prihlasovacich udajov odoslanych z formulara metodou POST.
 */
router.post("/check", function (req, res) {
  // data z formulara su ulozene v tele (body) POST poziadavky.
  authenticate(req.body.username, req.body.password).then(async (user) => {
    if (user) {
      req.session.user = user;
      console.log("Login OK", user);
      await req.flash("success", "Login OK");
      // kedze pouzivam pomalsie ulozisko pre session data (subory) pockam na ulozenie sesison a az potom presmerujem
      req.session.save(() => {
        res.redirect("/");
      });
    } else {
      console.log("Login failed");
      await req.flash("error", "Chybné meno alebo heslo!");
      res.redirect("/user/login");
    }
  });
});

/**
 * Odhlasit prihlaseneho pouzivatela a zrusit session
 */
router.get("/logout", function (req, res) {
  let sessionName = req.session.name;
  req.session.destroy(async function (err) {
    if (err) {
      console.error(err);
    } else {
      res.clearCookie(sessionName);
      res.redirect("/");
    }
  });
});

//Zabezpečená cesta na zobrazenie stránky správcu
router.get("/admin", (req, res) => {
  // Kontrola, či je používateľ správcom
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).send("Prístup zamietnutý");
  }
  res.send("Stránka správcu");
});

router.delete(
  "/admin/comments/:commentId/delete",
  authorize("admin"),
  async (req, res) => {
    try {
      const commentId = req.params.commentId;

      // SQL dotaz na odstránenie komentára s identifikátorom commentId
      const sql = "DELETE FROM comments WHERE id = ?";
      await db.promise().query(sql, [commentId]);

      res.status(200).send("Komentár bol úspešne odstránený");
    } catch (error) {
      console.error("Chyba databázy:", error.message);
      res.status(500).send("Interná chyba servera");
    }
  },
);
export { router as UserController };
