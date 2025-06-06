const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Author = require("./models/Author");
const Publisher = require("./models/Publisher");
const Product = require("./models/Product");

async function seedData() {
  try {
    await mongoose.connect("mongodb://localhost:27017/bookly_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Author.deleteMany({});
    await Publisher.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = new User({
      name: "Admin User",
      email: "admin@bookly.com",
      password: adminPassword,
      userType: "admin",
    });
    await adminUser.save();
    console.log("Admin user created");

    // Create regular user
    const userPassword = await bcrypt.hash("user123", 10);
    const regularUser = new User({
      name: "Regular User",
      email: "user@bookly.com",
      password: userPassword,
      userType: "user",
    });
    await regularUser.save();
    console.log("Regular user created");

    // Create authors
    const authors = [
      { authorName: "Mark Manson" },
      { authorName: "James Clear" },
    ];
    const createdAuthors = await Author.insertMany(authors);
    console.log("Authors created");

    // Create publishers
    const publishers = [
      { publisherName: "HarperCollins" },
      { publisherName: "Penguin Random House" },
    ];
    const createdPublishers = await Publisher.insertMany(publishers);
    console.log("Publishers created");

    // Create products
    const products = [
      {
        bookName: "The Subtle Art of Not Giving a Fuck",
        author: createdAuthors[0]._id,
        publisher: createdPublishers[0]._id,
        price: 15,
        image: "The Subtle Art of Not Giving a Fuck.jpg",
        stockQuantity: 100,
        tag: "bestseller",
      },
      {
        bookName: "Atomic Habits",
        author: createdAuthors[1]._id,
        publisher: createdPublishers[1]._id,
        price: 20,
        image: "Atomic Habits.jpg",
        stockQuantity: 150,
        tag: "bestseller",
      },
    ];
    await Product.insertMany(products);
    console.log("Products created");

    console.log("Database seeded successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding data:", err);
    mongoose.connection.close();
  }
}

seedData();
