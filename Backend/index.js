const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const cors = require('cors');

const app = express();

app.use(express.json());
// Allow requests from your frontend
app.use(cors({ origin: "https://localhost:5173", credentials: true }));

// Handle preflight requests
app.options("*", cors());

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
