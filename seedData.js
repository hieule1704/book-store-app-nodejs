const mongoose = require("mongoose");
const Author = require("./models/Author");
const Product = require("./models/Product");
const Publisher = require("./models/Publisher");
require("dotenv").config();

async function seedData() {
  // Debug: Log the MONGODB_URI to verify it's being loaded
  console.log("MONGODB_URI:", process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  try {
    await Author.deleteMany({});
    await Publisher.deleteMany({});
    await Product.deleteMany({});

    const authors = await Author.insertMany([
      { authorName: "Mark Manson", profilePicture: "Mark-Manson.jpg" },
      { authorName: "James Clear", profilePicture: "James-Clear.jpeg" },
    ]);
    console.log("Authors seeded");

    const publishers = await Publisher.insertMany([
      { publisherName: "Jaico", profileImage: "Jaico-publisher.jpeg" },
      { publisherName: "Penguin", profileImage: "Penguin-publisher.jpeg" },
    ]);
    console.log("Publishers seeded");

    await Product.insertMany([
      {
        bookName: "The Subtle Art of Not Giving a F*ck",
        author: authors[0]._id,
        publisher: publishers[1]._id,
        bookDescription: "A counterintuitive approach to living a good life.",
        tag: "bestseller",
        publishYear: 2016,
        totalPage: 224,
        price: 15,
        image: "The Subtle Art of Not Giving a Fuck.jpg",
        stockQuantity: 100,
      },
      {
        bookName: "Atomic Habits",
        author: authors[1]._id,
        publisher: publishers[0]._id,
        bookDescription:
          "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
        tag: "bestseller",
        publishYear: 2018,
        totalPage: 320,
        price: 20,
        image: "Atomic Habits.jpg",
        stockQuantity: 100,
      },
    ]);
    console.log("Products seeded");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

seedData();
