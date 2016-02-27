'use strict';
var
  // サーバー用ライブラリ `express` のロード
  express = require('express'),
  // サーバーインスタンスの初期化
  app = express(),
  // 環境変数に `PORT` があればその値を、なければ 3000 を使用
  port = process.env.PORT || 3000,
  // リクエストに含まれるデータの取り出しを助けるライブラリのロード
  parser = require('body-parser'),
  // データベースへアクセスするライブラリのロード
  knex = require('knex')({
    client: 'sqlite3',
    connection: {
      // この設定で、データベースをメモリ内に生成する（永続性はなくなる）
      // `filename: "somefile.sqlite"` とかで、ファイルにデータを保存できる（ファイル名は自由）
      filename: ":memory:"
    }
  });

// リクエストデータの parser の導入
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

// /public フォルダを静的ソースを置く場所として指定 (css, image, js など)
app.use(express.static(__dirname + '/public'))

/****************************************
  *
  * API 実装サンプル
  *
  ***************************************/

app.get('/api/dummies', function (req, res, next) {
  res.status(200).json("OK");
  return next();
});

app.post('/api/dummies', function (req, res, next) {
  res.status(400).json({
    data: req.body,
    error: "BadRequest"
  });
  return next();
});

app.delete('/api/dummies/:id', function (req, res, next) {
  res.status(404).json({
    id: req.params.id,
    error: "NotFound"
  });
});

//
// /****************************************
//   *
//   * 基本 API 実装編
//   *
//   ***************************************/
// // GET /api/projects に対する処理を書く
// app./* method */(/* endpoint */, function (req, res, next) {
//   res.status(501).json("NotImplemented");
//
//   /**
//     * projects テーブルから
//     * 全てのデータを取得 (SELECT) する
//     */
//   return next();
// });
//
// // GET /api/projects/:id に対する処理を書く
// app./* method */(/* endpoint */, function (req, res, next) {
//   res.status(501).json("NotImplemented");
//
//   /**
//     * projects テーブルから
//     * パラメーターで受け取った id と一致するデータ (WHERE)
//     * を取得 (SELECT) する
//     *
//     * 一致するデータがなかった場合の処理を忘れずに ;)
//     */
//   return next();
// });
//
// // DELETE /api/projects/:id に対する処理を書く
// app./* method */(/* endpoint */, function (req, res, next) {
//   res.status(501).json("NotImplemented");
//
//   /**
//     * projects テーブルから
//     * パラメーターで受け取った id と一致するデータ (WHERE)
//     * を取得 (SELECT) する
//     *
//     * 一致するデータがなかった場合の処理を忘れずに ;)
//     */
//   return next();
// });
//
// // POST /api/projects に対する処理を書く
// app./* method */(/* endpoint */, function (req, res, next) {
//    res.status(501).json("NotImplemented");
// });


/**
  * Initialize database
  * This could work on multiple table definition also
  */
// SQL全文 の取得
// ; がテーブル定義の区切りとなるので `;` で終わる行でここのテーブルに分割
var sqls = require('fs')
      .readFileSync(__dirname + '/specifications/database.sql')
      .toString()
      .split(/;$/m);

var allSQLs = sqls.map(function (sql) {
  return sql.trim();
}).filter(function (sql) {
  // SQL文が空だと `Segmentation fault: 11` が発生するので切り捨てる
  return !!sql;
}).map(function (sql) {
  return knex.raw(sql);
});

// 全部のSQLを実行してテーブルを作成が完了したらサーバーを起動
Promise.all(allSQLs).then(function () {
  app.listen(port, function () {
    console.log("Server is running with port", port);
  });
});
