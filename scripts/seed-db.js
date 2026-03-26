const { sequelize, Category, Author, Publisher, Book } = require("../models");
const env = require("../config/env");

const categoriesData = [
  {
    name: "Ciencia ficcion",
    description: "historias futuristas, viajes espaciales y tecnologia avanzada"
  },
  {
    name: "Fantasia",
    description: "mundos imaginarios con magia, criaturas y aventuras epicas"
  },
  {
    name: "Suspenso",
    description: "tramas de tension, misterio y giros inesperados"
  },
  {
    name: "Drama",
    description: "relatos enfocados en conflictos humanos y emocionales"
  },
  {
    name: "Terror",
    description: "obras con atmosfera oscura y elementos sobrenaturales"
  },
  {
    name: "Clasicos",
    description: "titulos influyentes y representativos de distintas epocas"
  }
];

const authorsData = [
  { name: "Frank Herbert", email: "frank.herbert@bookapp.dev" },
  { name: "J. R. R. Tolkien", email: "tolkien@bookapp.dev" },
  { name: "Michael Crichton", email: "michael.crichton@bookapp.dev" },
  { name: "Mario Puzo", email: "mario.puzo@bookapp.dev" },
  { name: "Stephen King", email: "stephen.king@bookapp.dev" },
  { name: "Andy Weir", email: "andy.weir@bookapp.dev" },
  { name: "Jane Austen", email: "jane.austen@bookapp.dev" },
  { name: "Bram Stoker", email: "bram.stoker@bookapp.dev" }
];

const publishersData = [
  { name: "Editorial Nova", phone: "+1-809-555-1001", country: "Republica Dominicana" },
  { name: "Planeta", phone: "+34-900-200-300", country: "Espana" },
  { name: "Penguin Random House", phone: "+1-212-782-9000", country: "Estados Unidos" },
  { name: "Alfaguara", phone: "+34-915-357-300", country: "Espana" },
  { name: "Minotauro", phone: "+54-11-5555-1100", country: "Argentina" }
];

const booksData = [
  {
    title: "Dune",
    publishedYear: 1965,
    coverImage: "https://picsum.photos/seed/dune/500/700",
    category: "Ciencia ficcion",
    authorEmail: "frank.herbert@bookapp.dev",
    publisher: "Editorial Nova"
  },
  {
    title: "El mesias de Dune",
    publishedYear: 1969,
    coverImage: "https://picsum.photos/seed/dune2/500/700",
    category: "Ciencia ficcion",
    authorEmail: "frank.herbert@bookapp.dev",
    publisher: "Planeta"
  },
  {
    title: "El senor de los anillos",
    publishedYear: 1954,
    coverImage: "https://picsum.photos/seed/lotr/500/700",
    category: "Fantasia",
    authorEmail: "tolkien@bookapp.dev",
    publisher: "Minotauro"
  },
  {
    title: "El hobbit",
    publishedYear: 1937,
    coverImage: "https://picsum.photos/seed/hobbit/500/700",
    category: "Fantasia",
    authorEmail: "tolkien@bookapp.dev",
    publisher: "Minotauro"
  },
  {
    title: "Jurassic Park",
    publishedYear: 1990,
    coverImage: "https://picsum.photos/seed/jurassic/500/700",
    category: "Suspenso",
    authorEmail: "michael.crichton@bookapp.dev",
    publisher: "Penguin Random House"
  },
  {
    title: "La amenaza de Andromeda",
    publishedYear: 1969,
    coverImage: "https://picsum.photos/seed/andromeda/500/700",
    category: "Suspenso",
    authorEmail: "michael.crichton@bookapp.dev",
    publisher: "Penguin Random House"
  },
  {
    title: "El padrino",
    publishedYear: 1969,
    coverImage: "https://picsum.photos/seed/godfather/500/700",
    category: "Drama",
    authorEmail: "mario.puzo@bookapp.dev",
    publisher: "Alfaguara"
  },
  {
    title: "It",
    publishedYear: 1986,
    coverImage: "https://picsum.photos/seed/it/500/700",
    category: "Terror",
    authorEmail: "stephen.king@bookapp.dev",
    publisher: "Penguin Random House"
  },
  {
    title: "El resplandor",
    publishedYear: 1977,
    coverImage: "https://picsum.photos/seed/shining/500/700",
    category: "Terror",
    authorEmail: "stephen.king@bookapp.dev",
    publisher: "Penguin Random House"
  },
  {
    title: "Mision rescate",
    publishedYear: 2011,
    coverImage: "https://picsum.photos/seed/martian/500/700",
    category: "Ciencia ficcion",
    authorEmail: "andy.weir@bookapp.dev",
    publisher: "Editorial Nova"
  },
  {
    title: "Orgullo y prejuicio",
    publishedYear: 1813,
    coverImage: "https://picsum.photos/seed/pride/500/700",
    category: "Clasicos",
    authorEmail: "jane.austen@bookapp.dev",
    publisher: "Planeta"
  },
  {
    title: "Dracula",
    publishedYear: 1897,
    coverImage: "https://picsum.photos/seed/dracula/500/700",
    category: "Clasicos",
    authorEmail: "bram.stoker@bookapp.dev",
    publisher: "Alfaguara"
  }
];

async function upsertCategories() {
  const map = new Map();

  for (const item of categoriesData) {
    const [row, created] = await Category.findOrCreate({
      where: { name: item.name },
      defaults: item
    });

    if (!created && row.description !== item.description) {
      row.description = item.description;
      await row.save();
    }

    map.set(item.name, row);
  }

  return map;
}

async function upsertAuthors() {
  const map = new Map();

  for (const item of authorsData) {
    const [row, created] = await Author.findOrCreate({
      where: { email: item.email },
      defaults: item
    });

    if (!created && row.name !== item.name) {
      row.name = item.name;
      await row.save();
    }

    map.set(item.email, row);
  }

  return map;
}

async function upsertPublishers() {
  const map = new Map();

  for (const item of publishersData) {
    const [row, created] = await Publisher.findOrCreate({
      where: { name: item.name },
      defaults: item
    });

    if (!created) {
      const needsUpdate = row.phone !== item.phone || row.country !== item.country;
      if (needsUpdate) {
        row.phone = item.phone;
        row.country = item.country;
        await row.save();
      }
    }

    map.set(item.name, row);
  }

  return map;
}

async function upsertBooks(categoryMap, authorMap, publisherMap) {
  for (const item of booksData) {
    const category = categoryMap.get(item.category);
    const author = authorMap.get(item.authorEmail);
    const publisher = publisherMap.get(item.publisher);

    if (!category || !author || !publisher) {
      continue;
    }

    const [row, created] = await Book.findOrCreate({
      where: {
        title: item.title,
        authorId: author.id
      },
      defaults: {
        title: item.title,
        publishedYear: item.publishedYear,
        coverImage: item.coverImage,
        categoryId: category.id,
        authorId: author.id,
        publisherId: publisher.id
      }
    });

    if (!created) {
      row.publishedYear = item.publishedYear;
      row.coverImage = item.coverImage;
      row.categoryId = category.id;
      row.publisherId = publisher.id;
      await row.save();
    }
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const categoryMap = await upsertCategories();
    const authorMap = await upsertAuthors();
    const publisherMap = await upsertPublishers();
    await upsertBooks(categoryMap, authorMap, publisherMap);

    const [booksCount, categoriesCount, authorsCount, publishersCount] = await Promise.all([
      Book.count(),
      Category.count(),
      Author.count(),
      Publisher.count()
    ]);

    console.log(`seed completado en entorno ${env.env}`);
    console.log(
      JSON.stringify({
        books: booksCount,
        categories: categoriesCount,
        authors: authorsCount,
        publishers: publishersCount
      })
    );
  } catch (error) {
    console.error("no fue posible cargar seed", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
