const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

const baseUsers = [
  ["Arjun Kumar", "arjun.kumar"],
  ["Nithya Raman", "nithya.raman"],
  ["Praveen Raj", "praveen.raj"],
  ["Keerthana S", "keerthana.s"],
  ["Vikram Iyer", "vikram.iyer"],
  ["Meena Lakshmi", "meena.lakshmi"],
  ["Karthik Narayan", "karthik.narayan"],
  ["Divya Krishnan", "divya.krishnan"],
  ["Sanjay Menon", "sanjay.menon"],
  ["Priyadharshini M", "priyadharshini.m"],
  ["Harish Raghavan", "harish.raghavan"],
  ["Ananya Reddy", "ananya.reddy"],
  ["Siddharth Jain", "siddharth.jain"],
  ["Pavithra Devi", "pavithra.devi"],
  ["Rahul Verma", "rahul.verma"],
  ["Sneha Nair", "sneha.nair"],
  ["Gokul Prasad", "gokul.prasad"],
  ["Ishita Sharma", "ishita.sharma"],
  ["Madhan Subramani", "madhan.subramani"],
  ["Swetha Balaji", "swetha.balaji"],
  ["Rohit Bansal", "rohit.bansal"],
  ["Deepika Arul", "deepika.arul"],
  ["Akhil Joseph", "akhil.joseph"],
  ["Janani Venkat", "janani.venkat"],
];

const addressPool = [
  "T. Nagar, Chennai, Tamil Nadu",
  "Velachery, Chennai, Tamil Nadu",
  "Anna Nagar, Chennai, Tamil Nadu",
  "Coimbatore South, Tamil Nadu",
  "Madurai Main, Tamil Nadu",
  "Mylapore, Chennai, Tamil Nadu",
  "Koramangala, Bengaluru, Karnataka",
  "Indiranagar, Bengaluru, Karnataka",
  "Malleswaram, Bengaluru, Karnataka",
  "Kondapur, Hyderabad, Telangana",
  "Gachibowli, Hyderabad, Telangana",
  "Madhapur, Hyderabad, Telangana",
  "Andheri East, Mumbai, Maharashtra",
  "Thane West, Maharashtra",
  "Viman Nagar, Pune, Maharashtra",
  "Baner, Pune, Maharashtra",
  "Salt Lake, Kolkata, West Bengal",
  "Dwarka, New Delhi",
  "Noida Sector 62, Uttar Pradesh",
  "Vastrapur, Ahmedabad, Gujarat",
  "Alkapuri, Vadodara, Gujarat",
  "Kakkanad, Kochi, Kerala",
  "Kowdiar, Thiruvananthapuram, Kerala",
  "Civil Lines, Jaipur, Rajasthan",
];

const phoneForIndex = (index) => {
  const suffix = String(10000000 + index * 379).slice(-8);
  return `9${suffix}`;
};

const createdAtForIndex = (index) => {
  const date = new Date();
  const daysAgo = (index % 21) + Math.floor(index / 3);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9 + (index % 9), (index * 7) % 60, 0, 0);
  return date;
};

const buildUserDocs = async () => {
  const hashedPassword = await bcrypt.hash("Welcome@123", 10);

  return baseUsers.map(([name, emailAlias], index) => {
    const createdAt = createdAtForIndex(index);
    return {
      name,
      email: `${emailAlias}${index + 1}@gmail.com`,
      phone: phoneForIndex(index),
      address: addressPool[index % addressPool.length],
      totalOrders: index % 11,
      password: hashedPassword,
      passwordHash: hashedPassword,
      cart: [],
      orders: [],
      createdAt,
      updatedAt: createdAt,
    };
  });
};

const seedUsers = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in backend/.env");
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    await User.deleteMany({});
    const users = await buildUserDocs();
    const inserted = await User.insertMany(users, { ordered: true });
    console.log(`Inserted ${inserted.length} users`);
  } finally {
    await mongoose.disconnect();
  }
};

seedUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed users", error.message);
    process.exit(1);
  });