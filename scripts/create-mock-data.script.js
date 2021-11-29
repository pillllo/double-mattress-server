const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const {
  getRandomNumber: random,
  getDaysInMonth,
} = require("../src/helpers/helpers");

const FS_OPTS = { encoding: "utf-8" };
const OUTPUT_PATH = path.join(__dirname, "output");
const OUTPUT_FILENAME = "mock-data.json";

const CATEGORIES = {
  income: "Income",
  bills: "Bills and Services",
  home: "Home",
  shopping: "Shopping",
  entertainment: "Entertainment",
  eatingOut: "Eating Out",
  others: "Others",
};

const MONTHS_TO_GENERATE = 4;

//----------------------------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------------------------

function createUser(name, currency = "EUR") {
  const user = {
    userId: uuid(),
    firstName: name,
    currency,
    linkedUserIds: [],
  };
  return user;
}

function createCategories() {
  return Object.values(CATEGORIES);
}

function getRandomCategory(categories) {
  const allCatKeys = Object.keys(categories);
  const randomIdx = random(0, allCatKeys.length - 1);
  const randomCatKey = allCatKeys[randomIdx];
  return categories[randomCatKey];
}

function getRandomDescription(category) {
  let options;
  switch (category) {
    case "Income":
      options = [
        "Refund",
        "Spending money from granny",
        "Lottery win",
        "Found on floor",
      ];
      break;
    case "Bills and Services":
      options = [
        "Mobile phone",
        "Cat insurance",
        "Magazine subscription",
        "Car stuff",
        "Vet bills",
      ];
      break;
    case "Home":
      options = ["Wallpaper", "Glue", "Really nice glue", "best glue ever"];
      break;
    case "Shopping":
      options = [
        "Groceries",
        "Hardware store",
        "Clothes",
        "More clothes",
        "Even more clothes",
        "Pet food",
      ];
      break;
    case "Entertainment":
      options = [
        "Netflix",
        "Cinema",
        "Bowling",
        "Dance classes",
        "Horse vaulting lessons",
        "Drinks",
      ];
      break;
    case "Eating Out":
      options = [
        "Yangtze River",
        "WagaMama",
        "Burger King",
        "Luigi's",
        "Pret a Manger",
        "Caffe Nero",
      ];
      break;
    case "Others":
      options = ["Screwdriver", "New cat", "Dog food", "Pencil", "Batteries"];
      break;
  }

  const randomIdx = random(0, options.length - 1);
  return options[randomIdx];
}

//----------------------------------------------------------------
// MAIN
//----------------------------------------------------------------

// create users
const output = {};

const user1 = createUser("Annie");
const user2 = createUser("Ben");
user1.linkedUserIds.push(user2.userId);
user2.linkedUserIds.push(user1.userId);
output.users = [user1, user2];

// create categories
output.categories = createCategories();

// create [Transaction] for both user1 and user2
const now = new Date();
const dateNow = now.getDate();
const monthNow = now.getMonth();
const yearNow = now.getFullYear();
const months = new Array(MONTHS_TO_GENERATE)
  .fill(0)
  .map((_, idx) => monthNow - idx);

output.users.forEach((user) => {
  const { userId, firstName } = user;
  const userTransactions = [];
  // these don't change much from month to month, fix them now
  const salary = random(2000, 3000);
  const elecBill = random(80, 110);
  const gasBill = random(60, 90);
  const waterBill = random(2000, 3000);

  // function declared here to make use of user data in closure
  const createTransaction = (day, month, amount, category, description) => {
    return {
      transactionId: uuid(),
      transactionType: category === CATEGORIES.income ? "income" : "expense",
      userId,
      userName: firstName,
      amount: amount * 100 + random(0, 99),
      currency: "EUR",
      category,
      date: new Date(yearNow, month, day).toISOString(),
      description: description || getRandomDescription(category),
    };
  };

  months.forEach((month) => {
    // create recurring transactions for months in question
    const salaryT = createTransaction(
      dateNow,
      month,
      salary,
      CATEGORIES.income,
      "Salary from EvilCorp"
    );

    const elecT = createTransaction(
      dateNow,
      month,
      elecBill,
      CATEGORIES.bills,
      "Utilities: electricity"
    );

    const gasT = createTransaction(
      dateNow,
      month,
      gasBill,
      CATEGORIES.bills,
      "Utilities: gas"
    );

    const waterT = createTransaction(
      dateNow,
      month,
      waterBill,
      CATEGORIES.bills,
      "Utilities: water"
    );

    userTransactions.push(salaryT);
    userTransactions.push(elecT);
    userTransactions.push(gasT);
    userTransactions.push(waterT);

    // random transactions
    let numRandomTransactions = random(70, 100);
    for (let i = 0; i <= numRandomTransactions; i += 1) {
      const category = getRandomCategory(CATEGORIES);
      const description = getRandomDescription(category);
      const randomTransaction = createTransaction(
        random(1, getDaysInMonth(yearNow, month)),
        month,
        random(5, 120),
        category,
        description
      );
      // console.log(randomTransaction);
      userTransactions.push(randomTransaction);
    }
  });

  output.transactions = output.transactions || [];
  output.transactions = output.transactions.concat(userTransactions);
});

// outputs file to /output folder (this directory is .gitignored)
fs.access(OUTPUT_PATH, (err) => {
  if (err && err.code === "ENOENT") fs.mkdirSync(OUTPUT_PATH);
  // 3rd argument to JSON.stringify puts in whitespace (pretty output, not single line)
  fs.writeFileSync(
    `${OUTPUT_PATH}/${OUTPUT_FILENAME}`,
    JSON.stringify(output, null, 2)
  );
});
