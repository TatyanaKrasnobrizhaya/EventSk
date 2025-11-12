import fs from "node:fs";
import * as Db from "./MariaClient.js";

/**
 * Pridat hodnotenie pre prispevok.
 * @param postId
 */
async function addLike(postId) {
  // aktualizacia hodnoty v databaze
  await Db.query("UPDATE posts SET rating = rating + 1 WHERE id = :postId", {
    postId: postId,
  });

  // nacitanie novej hodnoty
  let dbRes = await Db.query("SELECT rating FROM posts WHERE id = :postId", {
    postId: postId,
  });

  // vyber hodnoty z vysledku DB volania
  return dbRes.pop().rating;
}

/**
 * Vlozit novy prispevok
 *
 * @param userId
 * @param message
 * @param file
 * @param nazov
 * @param popis
 * @param mesto
 * @param date
 * @param typ
 * @param region
 * @returns {Promise<*>}
 */
async function addPost(
  userId,
  // message,
  nazov,
  popis,
  mesto,
  date,
  typ,
  region,
  file,
) {
  let dbResult;

  try {
    const newPath = file.replace("public", "");

    dbResult = await Db.query(
      "INSERT INTO posts (user_id, created_at, nazov, popis, mesto, date, typ, region, image_path) VALUES (:userId, now(), :nazov, :popis, :mesto, :date, :typ, :region, :imagePath)",
      {
        userId: userId,
        nazov: nazov,
        popis: popis,
        mesto: mesto,
        date: date,
        typ: typ,
        region: region,
        imagePath: newPath + ".jpg",
      },
    );
  } catch (error) {
    console.error("Error inserting post into the database:", error);
    throw error;
  }
  if (file) {
    const newPath = file + ".jpg";
    try {
      fs.renameSync(file, newPath);
    } catch (renameError) {
      console.error("Error renaming file:", renameError);
      throw renameError;
    }
  }
}

async function updatePost(
  userId,
  nazov,
  popis,
  mesto,
  date,
  typ,
  region,
  imagePath,
  postId,
) {
  console.log(
    "userId: " + userId,
    "nazov: " + nazov,
    "popis: " + popis,
    "mesto: " + mesto,
    "date: " + date,
    "typ: " + typ,
    "region: " + region,
    "imagePath: " + imagePath + ".jpg",
  );

  try {
    const newPath = imagePath.replace("public", "");
    await Db.query(
      "UPDATE posts SET user_id = :userId, nazov = :nazov, popis = :popis, mesto = :mesto, date = :date, typ = :typ, region = :region, image_path = :imagePath WHERE id = :postId",
      {
        userId: userId,
        nazov: nazov,
        popis: popis,
        mesto: mesto,
        date: date,
        typ: typ,
        region: region,
        imagePath: newPath + ".jpg",
        postId: postId,
      },
    );

    if (imagePath) {
      const newPath = imagePath + ".jpg";
      try {
        fs.renameSync(imagePath, newPath);
      } catch (renameError) {
        console.error("Error renaming file:", renameError);
        throw renameError;
      }
    }
  } catch (error) {
    console.error("Ошибка при обновлении поста в базе данных:", error);
    throw error;
  }
}

async function addComment(userId, postId, commentText) {
  try {
    await Db.query(
      "INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)",
      [postId, userId, commentText],
    );
    return { success: true };
  } catch (error) {
    console.error("Error adding comment to database:", error);
    throw error;
  }
}

async function sortedMethod(sortBy, filterBy) {
  try {
    const result = await Db.query(
      "SELECT * FROM posts ORDER BY " + sortBy + " " + filterBy,
    );
    return result;
  } catch (error) {
    console.error("Error sorting events:", error);
    return [];
  }
}

/**
 * Vymazat prispevok
 *
 * @param postId
 * @returns {Promise<*>}
 */
async function deletePost(postId) {
  let filePath = "public/images/post/" + postId + ".jpg";
  fs.access(filePath, (err) => {
    if (!err) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Subor ${filePath} sa nepodarilo vymazat: ${err}`);
        }
      });
    }
  });
  await Db.query("DELETE FROM posts WHERE id = :postId", { postId: postId });
}

/**
 * Vratit konkretny prispevok (vrati ho ako jednoprvkove pole).
 * @returns {Promise<*>}
 * @param postId
 */
async function findPost(postId) {
  return Db.query(
    "SELECT p.*, u.username FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?",
    [postId],
  );
}

/**
 * Vratit zoznam prispevkov vratane pouzivatelskeho mena autora zoradeny posla casu vytvorenia zostupne.
 * @returns {Promise<*>}
 */
async function findAllPosts() {
  return Db.query("SELECT * from posts");
}

// async function getAllComments() {
//   return Db.query(
//     "SELECT * from comments JOIN users on users.id = comments.user_id",
//   );
// }

async function getCommentsByPostId(postId) {
  return Db.query(
    "SELECT * from comments JOIN users on users.id = comments.user_id WHERE post_id= ?",
    [postId],
  );
}

export {
  addLike,
  addPost,
  findPost,
  findAllPosts,
  updatePost,
  deletePost,
  sortedMethod,
  addComment,
  // getAllComments,
  getCommentsByPostId,
};
