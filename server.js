const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Load .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================
// ⭐ MONGO DB CONNECTION ⭐
// ==========================
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✔ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error:", err));

// ==========================
// ⭐ MONGO MODEL ⭐
// ==========================
const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    degree: String,
    specialization: String,
    timestamp: String
});

const Registration = mongoose.model("Registration", registrationSchema);

// ==========================
// ⭐ EMAIL CONFIG ⭐
// ==========================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'expo7590@gmail.com',
        pass: 'ljvb tcgk yasj bjrf'
    }
});

// ==========================
// ⭐ PDF PATHS ⭐
// ==========================
const coursePDFs = {
    'Computer Science Engineering': 'pdfs/CSE_Course.pdf',
    'Mechanical Engineering': 'pdfs/Mechanical_Course.pdf',
    'Electrical Engineering': 'pdfs/Electrical_Course.pdf',
    'Civil Engineering': 'pdfs/Civil_Course.pdf',
    'Electronics and Communication': 'pdfs/ECE_Course.pdf',
    'Information Technology': 'pdfs/IT_Course.pdf',
    'Chemical Engineering': 'pdfs/Chemical_Course.pdf',
    'English Literature': 'pdfs/English_Course.pdf',
    'History': 'pdfs/History_Course.pdf',
    'Political Science': 'pdfs/Political_Science_Course.pdf',
    'Psychology': 'pdfs/Psychology_Course.pdf',
    'Sociology': 'pdfs/Sociology_Course.pdf',
    'Economics': 'pdfs/Economics_Course.pdf',
    'Fine Arts': 'pdfs/Fine_Arts_Course.pdf'
};

// ==========================
// ⭐ REGISTER API ⭐
// ==========================
app.post('/register', async (req, res) => {
    const { name, email, mobile, degree, specialization, timestamp } = req.body;

    try {
        // 1️⃣ Save to MongoDB
        const newEntry = new Registration({
            name,
            email,
            mobile,
            degree,
            specialization,
            timestamp
        });

        await newEntry.save();
        console.log("📌 Saved to MongoDB:", name);

        // 2️⃣ Check PDF Exists
        const pdfPath = coursePDFs[specialization];

        if (!pdfPath || !fs.existsSync(pdfPath)) {
            return res.status(400).json({
                success: false,
                message: `PDF not found for ${specialization}`
            });
        }

        // 3️⃣ Email sending
        const mailOptions = {
            from: 'expo7590@gmail.com',
            to: email,
            subject: `Course Details: ${specialization}`,
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for registering!</p>
                <p>You selected: <b>${specialization}</b> (${degree})</p>
                <p>Please find the attached PDF brochure.</p>
                <br>
                <p>Regards,<br><b>Vijay</b></p>
            `,
            attachments: [
                {
                    filename: `${specialization.replace(/\s+/g, '_')}.pdf`,
                    path: pdfPath
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${email}`);

        res.json({
            success: true,
            message: "Registration saved + Email sent!"
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send("Course Registration API is running 🚀");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
