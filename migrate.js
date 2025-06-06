const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Author = require("./models/Author");
const Publisher = require("./models/Publisher");
const Product = require("./models/Product");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bookly_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB for migration"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Data from SQL
const authorsData = [
  { id: 1, authorName: "Mark Manson", profilePicture: "Mark-Manson.jpg" },
  { id: 2, authorName: "Mel Robbins", profilePicture: "Mel-Robbins.jpg" },
  { id: 3, authorName: "Joseph Nguyen", profilePicture: "Joseph-Nguyen.jpg" },
  { id: 4, authorName: "James Clear", profilePicture: "James-Clear.jpeg" },
  {
    id: 5,
    authorName: "Jordan Peterson",
    profilePicture: "Jordan-Peterson.jpeg",
  },
  { id: 6, authorName: "Garry Keller", profilePicture: "Garry Keller.jpg" },
  { id: 7, authorName: "Tim Vũ", profilePicture: "Tim-Vu.jpg" },
  { id: 8, authorName: "Jim Rohn", profilePicture: "Jim-Rohn.jpeg" },
  { id: 9, authorName: "Darren Hardy", profilePicture: "Darren Hardy.jpg" },
  {
    id: 10,
    authorName: "Emily Henry",
    profilePicture: "No-profile-picture.jpeg",
  },
  {
    id: 11,
    authorName: "Carley Fortune",
    profilePicture: "No-profile-picture.jpeg",
  },
];

const publishersData = [
  { id: 1, publisherName: "Jaico", profileImage: "Jaico-publisher.jpeg" },
  { id: 2, publisherName: "Penguin", profileImage: "Penguin-publisher.jpeg" },
  { id: 3, publisherName: "Puffin", profileImage: "Puffin-publisher.jpeg" },
  {
    id: 4,
    publisherName: "Bloomsbury",
    profileImage: "Bloomsbury-publisher.jpeg",
  },
  {
    id: 5,
    publisherName: "HarperOne",
    profileImage: "HarperOne-publisher.jpeg",
  },
  { id: 6, publisherName: "Nhã Nam", profileImage: "Nhã Nam-publisher.jpeg" },
];

const productsData = [
  {
    id: 1,
    bookName: "The Subtle Art of Not Giving a F*ck",
    author_id: 1,
    publisher_id: 2,
    bookDescription: "A counterintuitive approach to living a good life.",
    tag: "bestseller",
    publishYear: 2016,
    totalPage: 224,
    price: 15,
    image: "The Subtle Art of Not Giving a Fuck.jpg",
  },
  {
    id: 2,
    bookName: "Atomic Habits",
    author_id: 4,
    publisher_id: 4,
    bookDescription:
      "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
    tag: "bestseller",
    publishYear: 2018,
    totalPage: 320,
    price: 20,
    image: "Atomic Habits.jpg",
  },
  {
    id: 3,
    bookName: "The ONE Thing",
    author_id: 6,
    publisher_id: 1,
    bookDescription:
      "The surprisingly simple truth behind extraordinary results.",
    tag: "bestseller",
    publishYear: 2013,
    totalPage: 240,
    price: 17,
    image: "The ONE Thing.jpg",
  },
  {
    id: 4,
    bookName: "12 Rules for Life",
    author_id: 5,
    publisher_id: 1,
    bookDescription: "An Antidote to Chaos.",
    tag: "sales",
    publishYear: 2018,
    totalPage: 409,
    price: 30,
    image: "12 Rules for Life.jpg",
  },
  {
    id: 5,
    bookName: "Great Big Beautiful Life",
    author_id: 10,
    publisher_id: 1,
    bookDescription:
      "Cuốn sách truyền cảm hứng từ Emily Henry về việc sống một cuộc đời rực rỡ, đậm sắc màu cảm xúc và sự tự do nội tâm.",
    tag: "new release",
    publishYear: 2020,
    totalPage: 250,
    price: 18,
    image: "5c0c42743210874ede011.jpg",
  },
  {
    id: 6,
    bookName: "One Golden Summer",
    author_id: 11,
    publisher_id: 3,
    bookDescription:
      "A summer filled with light and unforgettable memories. Carley Fortune tells a story of love and life-changing decisions.",
    tag: "new release",
    publishYear: 2022,
    totalPage: 320,
    price: 20,
    image: "One golden Summer.jpg",
  },
  {
    id: 7,
    bookName: "Warriors",
    author_id: 8,
    publisher_id: 2,
    bookDescription:
      "A fantasy story about warrior cats, their survival, loyalty, and honor.",
    tag: "",
    publishYear: 2003,
    totalPage: 300,
    price: 16,
    image: "Warriors.jpg",
  },
  {
    id: 8,
    bookName: "The Wager",
    author_id: 10,
    publisher_id: 1,
    bookDescription:
      "David Grann recounts a remarkable survival journey at sea, betrayal, and extraordinary willpower.",
    tag: "new release",
    publishYear: 2023,
    totalPage: 288,
    price: 31,
    image: "The wager.jpg",
  },
  {
    id: 9,
    bookName: "Don’t Believe Everything You Think",
    author_id: 3,
    publisher_id: 2,
    bookDescription:
      "Joseph Nguyen explains how the mind creates suffering and how to live more peacefully by not believing every thought.",
    tag: "bestseller",
    publishYear: 2022,
    totalPage: 160,
    price: 12,
    image: "Dont belie everything you think.jpg",
  },
  {
    id: 10,
    bookName: "Beyond Thoughts",
    author_id: 3,
    publisher_id: 2,
    bookDescription:
      "A deep look into presence and how to transcend negative thinking for inner peace.",
    tag: "bestseller",
    publishYear: 2020,
    totalPage: 170,
    price: 14,
    image: "Beyond thoughts.jpg",
  },
  {
    id: 11,
    bookName: "Bí quyết thành công ở đại học",
    author_id: 7,
    publisher_id: 6,
    bookDescription:
      "Tim Vũ shares practical strategies for effective learning and building a career from the university years.",
    tag: "",
    publishYear: 2019,
    totalPage: 200,
    price: 10,
    image: "Bí quyết thành công ở đại học.jpg",
  },
  {
    id: 12,
    bookName: "The Overthinker’s Guide to Making Decisions",
    author_id: 3,
    publisher_id: 4,
    bookDescription:
      "A guide for overthinkers on simplifying decisions, reducing anxiety, and taking effective action.",
    tag: "new release",
    publishYear: 2023,
    totalPage: 160,
    price: 13,
    image: "The overthinker guide to making decision.jpg",
  },
  {
    id: 13,
    bookName: "Boundaries = Freedom",
    author_id: 3,
    publisher_id: 4,
    bookDescription:
      "Setting boundaries is the first step to personal freedom, life control, and healthier relationships.",
    tag: "bestseller",
    publishYear: 2020,
    totalPage: 160,
    price: 13,
    image: "Boundaries equal freedom.jpg",
  },
  {
    id: 14,
    bookName: "Models: Attract Women Through Honesty",
    author_id: 1,
    publisher_id: 1,
    bookDescription:
      "Mark Manson explores how to become more attractive through honesty, self-improvement, and real value.",
    tag: "bestseller",
    publishYear: 2020,
    totalPage: 280,
    price: 13,
    image: "Models Attract Women Through Honesty.jpg",
  },
  {
    id: 15,
    bookName:
      "Take Charge of Your Life: Unlocking Influence, Wealth and Potential",
    author_id: 8,
    publisher_id: 5,
    bookDescription:
      "Jim Rohn shares timeless principles for mastering life, cultivating positive thinking, and achieving personal success.",
    tag: "classic",
    publishYear: 1985,
    totalPage: 150,
    price: 16,
    image:
      "Take Charge of Your Life Unlocking Influence, Wealth, and Power.jpg",
  },
  {
    id: 16,
    bookName: "The 5 Second Rule",
    author_id: 2,
    publisher_id: 2,
    bookDescription:
      "Mel Robbins presents a simple method to take action, overcome procrastination, and build confidence in 5 seconds.",
    tag: "bestseller",
    publishYear: 2017,
    totalPage: 240,
    price: 18,
    image: "The 5 second rule.jpg",
  },
  {
    id: 17,
    bookName: "The Compound Effect",
    author_id: 9,
    publisher_id: 5,
    bookDescription:
      "Darren Hardy emphasizes how small consistent actions lead to extraordinary success over time.",
    tag: "bestseller",
    publishYear: 2017,
    totalPage: 240,
    price: 18,
    image: "The Compound Effect.jpg",
  },
  {
    id: 18,
    bookName: "The Day That Turns Your Life Around",
    author_id: 8,
    publisher_id: 3,
    bookDescription:
      "Jim Rohn shares stories about turning points in life and how we can create our own breakthroughs.",
    tag: "classic",
    publishYear: 1993,
    totalPage: 130,
    price: 14,
    image: "The Day that Turns Your Life Around.jpg",
  },
  {
    id: 19,
    bookName: "The Let Them Theory",
    author_id: 2,
    publisher_id: 1,
    bookDescription:
      "Mel Robbins introduces the “Let Them” theory to reduce stress and live according to your own values.",
    tag: "new release",
    publishYear: 2023,
    totalPage: 180,
    price: 15,
    image: "The let them theory.jpg",
  },
  {
    id: 20,
    bookName: "The Power of Ambition",
    author_id: 8,
    publisher_id: 1,
    bookDescription:
      "Jim Rohn inspires readers to pursue ambition, set goals, and stay committed to success.",
    tag: "",
    publishYear: 1994,
    totalPage: 140,
    price: 15,
    image: "The Power of Ambition.jpg",
  },
];

// Migration function
async function migrateData() {
  try {
    // Clear existing data (optional)
    await Author.deleteMany({});
    await Publisher.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing data in collections");

    // Insert Authors
    const authorDocs = await Author.insertMany(
      authorsData.map((author) => ({
        authorName: author.authorName,
        profilePicture: author.profilePicture,
      }))
    );
    console.log("Inserted authors:", authorDocs.length);

    // Create a mapping of SQL author_id to MongoDB _id
    const authorIdMap = new Map();
    authorsData.forEach((author, index) => {
      authorIdMap.set(author.id, authorDocs[index]._id);
    });

    // Insert Publishers
    const publisherDocs = await Publisher.insertMany(
      publishersData.map((publisher) => ({
        publisherName: publisher.publisherName,
        profileImage: publisher.profileImage,
      }))
    );
    console.log("Inserted publishers:", publisherDocs.length);

    // Create a mapping of SQL publisher_id to MongoDB _id
    const publisherIdMap = new Map();
    publishersData.forEach((publisher, index) => {
      publisherIdMap.set(publisher.id, publisherDocs[index]._id);
    });

    // Insert Products with mapped references
    const productsToInsert = productsData.map((product) => ({
      bookName: product.bookName,
      author: authorIdMap.get(product.author_id),
      publisher: publisherIdMap.get(product.publisher_id),
      bookDescription: product.bookDescription,
      tag: product.tag || undefined, // MongoDB will omit undefined fields
      publishYear: product.publishYear,
      totalPage: product.totalPage,
      price: product.price,
      image: product.image,
      stockQuantity: 100, // Default value as per previous usage
    }));

    const productDocs = await Product.insertMany(productsToInsert);
    console.log("Inserted products:", productDocs.length);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Error during migration:", err);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the migration
migrateData();
