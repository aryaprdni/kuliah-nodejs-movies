const express = require("express");
const bodyParser = require("body-parser");
const koneksi = require("./config/database");
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

app.post("/api/movies/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password' });
    }

    const querySql = 'INSERT INTO users (username, password) VALUES (?, ?)';

    koneksi.query(querySql, [username, hashedPassword], (err, rows, field) => {
      if (err) {
        return res.status(500).json({ message: 'Error registering user', error: err });
      }
      res.status(201).json({ success: true, message: 'User registered successfully', data: rows });
    });
  })
})

app.post('/api/movies/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const querySql = 'SELECT * FROM users WHERE username = ?';
  koneksi.query(querySql, [username], (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err });
    }
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    bcrypt.compare(password, rows[0].password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Ada kesalahan', error: err });
      }
      if (!result) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
      res.status(200).json({ success: true, message: 'Login success', token });
    })
  })
})

// buat server nya menggunakan port sesuai settingan konstanta = 5000
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
