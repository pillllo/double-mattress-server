import axios from "axios";

//----------------------------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------------------------

function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

// Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
// but by using 0 as the day it will give us the last day of the prior
// month. So passing in 1 as the month number will return the last day
// of January, not February
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function createUser(name, currency = "EUR") {
  const user = {
    firstName: name,
    email: `${name.toLowerCase()}@dm.com`,
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
  console.log("getRandomDescription() for category: ", category);
  let options;
  switch (category) {
    case "Other Income":
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
      options = [
        "Screwdriver",
        "New cat",
        "Dog food",
        "Bendy pencil",
        "Car battery",
      ];
      break;
  }

  const randomIdx = random(0, options.length - 1);
  return options[randomIdx];
}

async function processTransactions(transactions) {
  console.log("processTransactions()");
  // const toProcess = 10;
  const toProcess = transactions.length;
  let errors = [];
  for (let i = 0; i < toProcess; i += 1) {
    try {
      console.log(`transaction: ${i} of ${toProcess}`);
      const t = transactions[i];
      const tResult = await axios.post(`${SERVER_URL}/transactions/create`, t);
      if (!tResult.data) throw new Error("transaction create error");
    } catch (err) {
      errors.push(err);
      console.error(err);
      console.error("ERROR: total errors: ", errors.length);
    }
  }
  console.log("Finished with errors: ", errors.length);
}

//----------------------------------------------------------------
// MAIN
//----------------------------------------------------------------

// these can be changed, but some are specifically referenced by property
// in main() e.g. when adding salary entries, bills et - take care

const CATEGORIES = {
  salary: "Salary",
  otherIncome: "Other Income",
  bills: "Bills and Services",
  home: "Home",
  shopping: "Shopping",
  entertainment: "Entertainment",
  eatingOut: "Eating Out",
  others: "Others",
};

// change these freely to alter script behaviour
const SERVER_URL = "http://localhost:6666";
const MONTHS_TO_GENERATE = 12;
const USER_1_NAME = "Annie";
const USER_2_NAME = "Ben";

(async function main() {
  // create users
  try {
    const user1Data = createUser(USER_1_NAME);
    const user2Data = createUser(USER_2_NAME);
    const res1 = await axios.post(`${SERVER_URL}/users/create`, user1Data);
    if (!res1.data) throw new Error("server error");
    const user1 = res1.data;
    const res2 = await axios.post(`${SERVER_URL}/users/create`, user2Data);
    const user2 = res2.data;

    // create [Transaction] for both user1 and user2
    let allTransactions = [];

    const now = new Date();
    const dateNow = now.getDate();
    const monthNow = now.getMonth();
    const yearNow = now.getFullYear();
    const months = new Array(MONTHS_TO_GENERATE)
      .fill(0)
      .map((_, idx) => monthNow - idx);

    [user1, user2].forEach((user) => {
      const { userId } = user;
      // these don't change much from month to month, fix them now
      const salary = random(3200, 3500);
      const elecBill = random(80, 90);
      const gasBill = random(60, 80);
      const waterBill = random(60, 70);

      // function declared here to make use of user data in closure
      const createTransaction = (day, month, amount, category, description) => {
        const hour = random(0, 23);
        const minute = random(0, 59);
        return {
          transactionType:
            category === CATEGORIES.salary ||
            category === CATEGORIES.otherIncome
              ? "income"
              : "expense",
          userId,
          amount: amount * 100 + random(0, 99),
          currency: "EUR",
          category,
          date: new Date(yearNow, month, day, hour, minute).toISOString(),
          description: description || getRandomDescription(category),
        };
      };

      months.forEach((month, idx) => {
        const monthTransactions = [];
        // create recurring transactions for months in question
        const salaryT = createTransaction(
          dateNow,
          month,
          salary,
          CATEGORIES.salary,
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

        monthTransactions.push(salaryT);
        monthTransactions.push(elecT);
        monthTransactions.push(gasT);
        monthTransactions.push(waterT);

        // random transactions for the month
        let numRandomTransactions = random(50, 80);
        for (let i = 0; i <= numRandomTransactions; i += 1) {
          const categoriesNoSalary = { ...CATEGORIES };
          delete categoriesNoSalary.salary;
          const category = getRandomCategory(categoriesNoSalary);
          const description = getRandomDescription(category);
          const randomTransaction = createTransaction(
            random(1, getDaysInMonth(yearNow, month)),
            month,
            random(5, 102),
            category,
            description
          );
          monthTransactions.push(randomTransaction);
        }
        console.log(`generated ${monthTransactions.length} in month ${idx}`);
        allTransactions = allTransactions.concat(monthTransactions);
      }); // months.forEach()
    }); // users.forEach()
    processTransactions(allTransactions);
  } catch (err) {
    console.error(err);
  }
})();
