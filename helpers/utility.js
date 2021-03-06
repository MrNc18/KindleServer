const Joi = require("joi");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { file } = require("googleapis/build/src/apis/file");

var utility = {};
utility.randomString = (length) => {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
};

utility.generateToken = (length) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, function (err, buf) {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString("hex"));
      }
    });
  });
};

utility.fileupload = (files) => {
  return new Promise(async (resolve, reject) => {
    let name = await utility.randomString(5);
    var currentPath = process.cwd();
    var file_path = path.join(currentPath, "/public/images");

    var filedata = files.image.mv(
      file_path + "/" + name + files.image.name,
      (error, data) => {
        if (error) {
          reject(null);
        } else {
          resolve(name + files.image.name);
        }
      }
    );
  });
};

utility.fileupload2 = async (files) => {
  return new Promise(async (resolve, reject) => {
    let listKeys = Object.keys(files);
    //let name = await utility.randomString(5);
    var currentPath = process.cwd();
    var file_path = path.join(currentPath, "/public/images");
    var filedata = files[listKeys[0]].mv(
      file_path + "/" + files[listKeys[0]].name,
      (error, data) => {
        if (error) {
          reject(null);
        } else {
          resolve(files[listKeys[0]].name);
        }
      }
    );
  });
};

utility.generateSlug = (title, table) => {
  return new Promise(async (resolve, reject) => {
    var data = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    var result = await table.findAll({
      where: {
        slug: data,
      },
    });
    if (result.length > 0) {
      resolve(data + "-" + result.length);
    } else {
      resolve(data);
    }
  });
};

utility.checkTagAndCreate = (tags, bookId, book_tag, tag_relationship) => {
  return new Promise(async (resolve, reject) => {
    tags = tags.split(",");
    tags.forEach((tag) => {
      var slug = tag
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

      book_tag
        .findOne({
          where: {
            slug: slug,
          },
        })
        .then((result) => {
          if (!result) {
            let tagData = {
              slug: slug,
              name: tag,
            };
            book_tag.create(tagData).then((t_result) => {
              let relationship = {
                bookId: bookId,
                tagId: t_result.id,
              };
              tag_relationship
                .destroy({
                  where: {
                    bookId: bookId,
                  },
                })
                .then((data) => {
                  tag_relationship
                    .create(relationship)
                    .then((r_result) => {
                      resolve(r_result);
                    })
                    .catch((error) => {
                      reject(error);
                    });
                })
                .catch((error) => {
                  reject(error);
                });
            });
          } else {
            let relationship = {
              bookId: bookId,
              tagId: result.id,
            };
            tag_relationship
              .destroy({
                where: {
                  bookId: bookId,
                },
              })
              .then((data) => {
                tag_relationship
                  .create(relationship)
                  .then((r_result) => {
                    resolve(r_result);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          }
        });
    });
  });
};

utility.uploadBase64Image = (imgBase64) => {
  return new Promise(async (resolve, reject) => {
    let name = await utility.randomString(12);
    let mimeType = imgBase64.match(/[^:/]\w+(?=;|,)/)[0];
    let filename = "img_" + name + "." + mimeType;
    var currentPath = process.cwd();
    var file_path = path.join(currentPath, "/public/images");

    // Remove header
    let base64Image = imgBase64.split(";base64,").pop();

    fs.writeFile(
      file_path + "/" + filename,
      base64Image,
      "base64",
      function (err) {
        if (err) {
          reject(filename);
        }
      }
    );
    resolve(filename);
  });
};

module.exports = utility;
