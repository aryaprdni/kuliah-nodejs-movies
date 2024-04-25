const express = require("express");
const bodyParser = require("body-parser");
const koneksi = require("./config/database");
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("./public"));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({ storage: storage });

// read data / get data
app.get("/api/movies", (req, res) => {
  // buat query sql
  const querySql = "SELECT * FROM movies";

  // jalankan query
  koneksi.query(querySql, (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // jika request berhasil
    res.status(200).json({ success: true, data: rows });
  });
});

// read data / get data by id
app.get("/api/movies-specific/:id", (req, res) => {
  // buat query sql
  const querySql = "SELECT judul, rating, deskripsi from movies where id=?";

  // jalankan query
  koneksi.query(querySql, req.params.id, (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // jika request berhasil
    res.status(200).json({ success: true, data: rows });
  });
});

app.post('/api/movies', upload.single('image'), (req, res) => {
  if (!req.file) {
    console.log("No file upload");
    const data = {...req.body};
    const querySql = 'INSERT INTO movies (judul, rating, deskripsi, sutradara) VALUES (?, ?, ?, ?)'
    const judul = req.body.judul;
    const rating = req.body.rating;
    const deskripsi = req.body.deskripsi;
    const sutradara = req.body.sutradara;

    // jalankan query
    koneksi.query(querySql, [judul, rating, deskripsi, sutradara], (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: 'Gagal insert data', error: err })
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Data berhasil ditambahkan', data: rows })
    })
  } else {
    console.log(req.file.filename)
    var imgsrc = 'http://localhost:3000/images/' + req.file.filename;
    // buat variabel penampung data dan query sql
    const data = { ...req.body};
    const querySql = 'INSERT INTO movies (judul, rating, deskripsi, sutradara, foto) VALUES (?, ?, ?, ?, ?)'
    const judul = req.body.judul;
    const rating = req.body.rating;
    const deskripsi = req.body.deskripsi;
    const sutradara = req.body.sutradara;
    const foto = imgsrc;

    // jalankan query
    koneksi.query(querySql, [judul, rating, deskripsi, sutradara, foto], (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: 'Gagal insert data', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Data berhasil ditambahkan', data: rows })
    })
  };
})

app.delete('/api/movies/:id', (req, res) => {
  const querySql = 'DELETE FROM movies WHERE id = ?'
  koneksi.query(querySql, [req.params.id], (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err })
    }
    res.status(200).json({ success: true, message: 'Data berhasil di hapus', data: rows })
  })
})

app.get("/api/movies/filter/:judul", (req, res) => {
  // buat query sql
  const querySql = "SELECT * FROM movies WHERE judul LIKE \'%" + req.params.judul + "%\'";

  // jalankan query
  koneksi.query(querySql, (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // jika request berhasil
    res.status(200).json({ success: true, data: rows });
  });
});

// buat server nya menggunakan port sesuai settingan konstanta = 5000
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
