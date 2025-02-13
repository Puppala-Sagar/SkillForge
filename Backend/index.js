const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const cors = require('cors');

const app = express();

app.use(express.json());
const cors = require('cors');
app.use(cors({
  origin: ['https://skill-forge-app.vercel.app', 'https://skill-forge-app-git-main-puppala-sagars-projects.vercel.app'],
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));


app.use(authMiddleware);
app.use('/api', userRoutes);
app.get('/',(req,res)=> res.send("hello"));
mongoose.connect(config.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(config.PORT, () => {
            console.log(`Server is running on port ${config.PORT}`);
        });
    })
    .catch(err => console.error(err));
