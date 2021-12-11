# Double Mattress

A mobile-first web app that helps couples visualise and forecast combined financial infomation.

# Screenshots

<p>
<img src="readme_screenshot_1.png" />
<img src="readme_screenshot_2.png" />
</p>

This repository is for the server-side of the project. If you want to have access to the client repository click [here](https://github.com/pillllo/double-mattress).

# Getting started (server)

1. Clone this repo and enter

```
git clone https://github.com/pillllo/double-mattress-server
cd mentee-match
```

2. Install dependencies

```
npm install
```

3. Start the server

```
npm run dev
```

4. Install the client repo: Follow instructions in `Getting started` in the [Double Mattress client repo](https://github.com/pillllo/double-mattress).

# Tech Stack

- [Node.js](https://nodejs.org/en/) with [TypeScript](https://www.typescriptlang.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)
- [Socket.io](https://socket.io/)
- [Stripe](https://stripe.com)
- [Heroku](https://heroku.com)
- [Figma](https://figma.com) & [FigJam](https://www.figma.com/figjam/)
- A double mattress 🛏

# Team

- [Natalie Pilling](https://github.com/pillllo)
- [James Foxlee](https://github.com/cortexlock)
- [David Longaron](https://github.com/MrDfu)
- [Liam Morris](https://github.com/Aothe)

# Server structure

- `/src`: TypeScript source files
- `/build`: compiled JS from TypeScript source files
- `/prisma`: database schema and migration files
- `/scripts`: seed file for populating the database

# Get all user IDs (for development purposes only)

## `GET /userIds`

Get userIds for all users in the database. This will be retired after

**Request body**

Empty.

**Response**

Returns an array of `userId` (type: string) `for every user in the database. For development only.

Sample response:

```
[
    "1bddbb04-781f-4c2e-b871-bb624e6d9d7f",
    "d33d70c9-c01b-42a5-a751-9e88e42a028a"
]
```

# Get user profile data

## `POST /users`

Get user profile data for a user and their linked users.

**Request body**

In the request body send an array for all the userIds you wish to get user profile data for (for a single user, send an array with a single user ID).

Sample request:

```
{
    "userId": "1bddbb04-781f-4c2e-b871-bb624e6d9d7f"
}
```

**Response body**

Returns an array of type `User`, with each having the following properties:

```
{
  "userId": string
  "firstName": string
  "currency": string
  "linkedUserIds": string[]
}
```

Sample response:

```
[
  {
    "userId": "1bddbb04-781f-4c2e-b871-bb624e6d9d7f",
    "firstName": "Billy",
    "currency": "EUR",
    "linkedUserIds": [
        "d33d70c9-c01b-42a5-a751-9e88e42a028a"
    ]
  },
  {
    "userId": "d33d70c9-c01b-42a5-a751-9e88e42a028a",
    "firstName": "Jemima",
    "currency": "EUR",
    "linkedUserIds": [
        "1bddbb04-781f-4c2e-b871-bb624e6d9d7f"
    ]
  }
]
```

# Create a user

## `POST /users/create`

**Request body**

In the request body send an object with `firstName`property and an array of any `linkedUserIds`.

Sample request:

```
{
  "userId": "c4f2af8d-d47c-48ab-95f1-20f0a2f54a93"
  "linkedUserIds": [
    "LINKED_USER_ID"
  ]
}
```

**Response body**

Returns the newly created `User`.

# Delete a user

## `POST /users/delete`

**Request body**

In the request body send an object with `userId` property matching the user you wish to delete.

Sample request:

```
{
  "userId": "c4f2af8d-d47c-48ab-95f1-20f0a2f54a93"
}
```

**Response body**

Returns data for the deleted `User`.

# Get dashboard for user & any linked users

## `POST /dashboard`

Get dashboard data for a user and their linked users, namely:

- any aggregate data for that month, provided the end of that month has elapsed
- a list of transactions for the desired month, for the user and any linked users

**Request body**

In the request body send an object with:

- `userId`: a user ID (type: string) for the user you wish to get transaction data for.
- `date`: an ISO 8601 date string (from `Date.toISOString()`) for any date or time within the month & year you wish to retrieve. If you request a date in the future, the requestb will be deemed invalid.

Sample request:

```
{
  "userId": "c4f2af8d-d47c-48ab-95f1-20f0a2f54a93",
  "date": "2021-08-16T04:19:56.119Z"  // will retrieve data for August 2021
}
```

**Response body**

Returns an object as follows:

```
{
  transactions: [], // unfiltered / unsorted transactions for all users
  categoryTotals: {
    home: {
      USER_A_ID: 456,
      USER_B_ID: 457,
    },
    shopping: 4567,
    ...
  },
  typeTotals: {
    income: {
      USER_A_ID: 98456798,
      USER_B_ID: 93485798,
    },
    expenses: {
     USER_A_ID: 456,
     USER_B_ID: 457,
    },
  savings: {
    // combined for all linked users
    currentMonth: 45774,
    monthlyAverageSinceJoining: 947698,
    totalSinceJoining: 456987798,
  }
}
```

# Get transactions for a user

## `POST /transactions`

Get transaction data for provided user and any linked users.

**Request body**

In the request body send an object with:

- `userId`: a user ID (type: string) for the user you wish to get transaction data for.
- `[transactionsPerUser]`: optionally specify number of transactions per user. Defaults to 30 transactions.

Sample request:

```
{
  "userId": "c4f2af8d-d47c-48ab-95f1-20f0a2f54a93",
  "transactionsPerUser": 100
}
```

**Response body**

Returns an array of type `Transaction`, with each having the following properties:

```
{
  "transactionId":    string
  "transactionType":  string // "income" | "expense"
  "userId":           string
  "amount":           integer // e.g. 1 EUR -> 100
  "currency":         string
  "category":         string
  "date":             string // as ISO 8601 string*
  "description":      string
  "includeAvg":       boolean // optional
}
```

Sample response:

```
[
  {
      "transactionId": "d3e27df9-f87d-40f9-a95a-c1635b0638bd",
      "transactionType": "expense",
      "userId": "c4f2af8d-d47c-48ab-95f1-20f0a2f54a93",
      "userName": "Annie",
      "amount": 11687,
      "currency": "EUR",
      "category": "Home",
      "date": "2021-12-01T00:00:00.000Z",
      "description": "Wallpaper"
  },
  {
      "transactionId": "2eee45ce-8922-44a2-adba-bcd4a06f010d",
      "transactionType": "expense",
      "userId": "c4f2af8d-d47c-48ab-95f1-20f0a2f54a93",
      "userName": "Annie",
      "amount": 4605,
      "currency": "EUR",
      "category": "Entertainment",
      "date": "2021-12-01T00:00:00.000Z",
      "description": "Cinema"
  },
  ...
]
```

# Create transaction for a user

## `POST /transactions/create`

Create a transaction for a given user.

**Request body**

In the request body send an object with the following properties. Note the `transactionId` is created by the server.

```
{
  "transactionType":  string    // "income" | "expense"
  "userId":           string
  "amount":           integer   // e.g. 1 EUR -> 100
  "currency":         string
  "category":         string
  "date":             string    // as ISO 8601 string*
  "description":      string
  "includeAvg":       boolean   // optional
}
```

Sample request:

```
{
  "transactionType": "expense",
  "userId": "869c1acc-c4e1-40fb-9ccc-87dd3c13d71a",
  "amount": 11111,
  "currency": "EUR",
  "category": "Shopping",
  "date": "2021-11-11T11:11:11.111Z",
  "description": "glue"
  "includeAvg": "true"
}
```

**Response body**

Returns an array of type `Transaction`, with each having the following properties:

```
{
  "transactionId":    string // GUID generated in the backend
  "transactionType":  string // "income" | "expense"
  "userId":           string
  "amount":           integer // e.g. 1 EUR -> 100
  "currency":         string
  "category":         string
  "date":             string // as ISO 8601 string*
  "description":      string
  "includeAvg":       boolean // optional, default true
}
```

Sample response:

```
{
  "transactionId": "d3e27df9-f87d-40f9-a95a-c1635b0638bd",
  "transactionType": "expense",
  "userId": "c4f2af8d-d47c-48ab-95f1-20f0a2f54a93",
  "userName": "Annie",
  "amount": 11687,
  "currency": "EUR",
  "category": "Home",
  "date": "2021-12-01T00:00:00.000Z",
  "description": "Wallpaper"
}
```

# Connect account to another

## `POST /connect/initiate`

**Request body**

In the request body send the `userId` of the requester, and the `email` of the other user they wish to connect to.

Sample request:

```
{
  "userId": "c4f2af8d-d47c-48ab-95f1-20f0a2f54a93",
  "email": "john.doe@example.com"
}
```

**Response body**

Returns the `firstName` and `email` of the requested user if the following conditions are met:

- requesting `userId` is valid
- `email` is a valid email
- reqesting user is not trying to connect to themselves
- neither requesting user nor other user are already linked
