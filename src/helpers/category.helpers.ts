import CategoryMap from "../types/category-map";

const CATEGORIES: CategoryMap = {
  salary: "Salary",
  otherIncome: "Other Income",
  bills: "Bills and Services",
  home: "Home",
  shopping: "Shopping",
  entertainment: "Entertainment",
  eatingOut: "Eating Out",
  others: "Others",
};

const CATEGORY_KEYS: CategoryMap = {};

for (const [key, value] of Object.entries(CATEGORIES)) {
  CATEGORY_KEYS[value] = key;
}

export function getCategoryFromKey(key: string) {
  return CATEGORIES[key];
}

export function getKeyFromCategoryName(catName: string) {
  return CATEGORY_KEYS[catName];
}
