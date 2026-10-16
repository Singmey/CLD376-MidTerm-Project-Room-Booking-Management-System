const express = require('express');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const dbconnect = require('./dbconnect.js');
const PersonModel = require('./person_schema.js');

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'registration' }));

/*
POST localhost:5000/reg/userregister
{
    "name": "Sarah",
    "email": "sarah@gmail.com",
    "password": "abcd",
    "phone": 12345678,
    "role": "user"
}

{
    "name": "Admin",
    "email": "admin@gmail.com",
    "password": "admin123",
    "phone": 99999999,
    "role": "admin"
}
*/

app.post('/userregister', async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).send({ message: 'name, email and password are required' });
        }

        // STEP 1: Check if email already exists
        const existingUser = await PersonModel.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ message: 'Email already registered' });
        }

        // STEP 2: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // STEP 3: Save the user (role is always "user" for public registration)
        const pobj = new PersonModel({
            name,
            email: email,
            password: hashedPassword,
            mobile: phone,
            role: role === 'admin' ? 'admin' : 'user'
        });

        await pobj.save();
        res.status(201).send({ message: 'User registered successfully' });

    } catch (err) {
        res.status(500).send({ message: err.message || 'Error registering user' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Registration Service is running on PORT NO: ${PORT}`));

