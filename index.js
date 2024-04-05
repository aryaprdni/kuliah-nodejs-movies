const express = require("express");
const bodyParser = require("body-parser");
const koneksi = require("./config/database");
const app = express();
const PORT = 3000;

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.post('/api/movies', (req, res) => {
  const data = {
    judul: req.body.judul,
    rating: req.body.rating,
    deskripsi: req.body.deskripsi,
    foto: req.body.foto,
    sutradara: req.body.sutradara,
  }
  const querySql = 'INSERT INTO movies (judul, rating, deskripsi, foto, sutradara) VALUES (?, ?, ?, ? , ?)'
  koneksi.query(querySql, [data.judul, data.rating, data.deskripsi, data.foto, data.sutradara], (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err })
    }
    res.status(200).json({ success: true, message: 'Data berhasil ditambahkan', data: rows })
  })
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

// buat server nya menggunakan port sesuai settingan konstanta = 5000
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
