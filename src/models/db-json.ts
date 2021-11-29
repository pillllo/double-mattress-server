import fs from 'fs';
import path from 'path';

import User from '../types/user';
import Category from '../types/category';
import Transaction from '../types/transaction';

const JSON_DB_PATH = path.join(__dirname, './mock-data.json');
const FS_OPTIONS = 'utf8';

let _db: any;
try {
  const json = fs.readFileSync(JSON_DB_PATH, FS_OPTIONS);
  _db = JSON.parse(json);
} catch (err) {
  console.error('Unable to read mock data JSON file: ', err);
}

export function getUsers (userIds: [string]): User[] {
  const result = [];
  for (let userId of userIds) {
    console.log('getUsers() retrieving userId: ', userId);
    const userData = _db.users.find((user: any) => user.userId === userId);
    userData && result.push(userData);
  }
  return result;
}

export function getTransactions (
  userIds: [string],
  transactionsPerUser?: number
): Transaction[] {
  let result: Transaction[] = [];
  for (let userId of userIds) {
    console.log('getTransactions() retrieving for userId: ', userId);
    const userTransactions =
      _db.transactions
        .filter((tr: Transaction) => tr.userId === userId)
        .sort((a: Transaction, b: Transaction) => {
          const aDate = new Date(a.date).getTime();
          const bDate = new Date(b.date).getTime();
          return bDate - aDate;
        })
        .slice(0, transactionsPerUser || 30)
    console.log(userTransactions.length);
    result = result.concat(userTransactions);
  }
  return result;
}

