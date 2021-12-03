import DynamicMap from "../types/dynamic-map";

const CATEGORIES: DynamicMap = {
  salary: "Salary",
  otherIncome: "Other Income",
  bills: "Bills and Services",
  home: "Home",
  shopping: "Shopping",
  entertainment: "Entertainment",
  eatingOut: "Eating Out",
  others: "Others",
};

const CATEGORY_KEYS: DynamicMap = {};

for (const [key, value] of Object.entries(CATEGORIES)) {
  CATEGORY_KEYS[value] = key;
}

export function getCategoryFromKey(key: string) {
  return CATEGORIES[key];
}

export function getKeyFromCategoryName(catName: string) {
  return CATEGORY_KEYS[catName];
}

export function getAllCategoryKeys() {
  return Object.keys(CATEGORIES);
}

export function getIncomeCategoryKeys() {
  return ["salary", "otherIncome"];
}

export function getExpenseCategoryKeys() {
  return Object.keys(CATEGORIES).filter((key) => {
    return key !== "salary" && key !== "otherIncome";
  });
}
