import moment from 'moment'

export default [
  {
    createdAt: moment().subtract(31, 'days').toDate(),
    name: 'Work out',
    order: 0,
    color: 'purple',
    metrics: [
      {
        createdAt: moment().subtract(31, 'days').toDate(),
        name: 'Miles run',
        isSnapshot: false,
        isDecreasing: false,
        weight: 50,
        reports: [...Array(30).keys()].map((i) => ({
          createdAt: moment().subtract(i, 'days').toDate(),
          date: moment().subtract(i, 'days').toDate(),
          value: Math.floor(Math.random() * 10),
        })),
      },
      {
        createdAt: moment().subtract(21, 'days').toDate(),
        name: 'Weight',
        isSnapshot: true,
        isDecreasing: true,
        weight: 25,
        reports: [...Array(20).keys()].map((i) => ({
          createdAt: moment().subtract(i, 'days').toDate(),
          date: moment().subtract(i, 'days').toDate(),
          value: 150 + Math.floor(Math.random() * 10),
        })),
      },
    ],
  },
  {
    createdAt: moment().subtract(21, 'days').toDate(),
    name: 'Write a book',
    order: 1,
    color: 'blue',
    metrics: [
      {
        createdAt: moment().subtract(21, 'days').toDate(),
        name: 'Pages written',
        isSnapshot: false,
        isDecreasing: false,
        weight: 60,
        reports: [...Array(20).keys()].map((i) => ({
          createdAt: moment().subtract(i, 'days').toDate(),
          date: moment().subtract(i, 'days').toDate(),
          value: Math.floor(Math.random() * 10),
        })),
      },
    ],
  },
  {
    createdAt: moment().subtract(21, 'days').toDate(),
    name: 'Read War and Peace',
    order: 2,
    color: 'green',
    metrics: [
      {
        createdAt: moment().subtract(21, 'days').toDate(),
        name: 'Pages read',
        isSnapshot: true,
        isDecreasing: false,
        weight: 80,
        reports: [...Array(20).keys()].map((i) => ({
          createdAt: moment().subtract(i, 'days').toDate(),
          date: moment().subtract(i, 'days').toDate(),
          value: 200 - i * 10 + Math.floor(Math.random() * 10),
        })),
      },
    ],
  },
  {
    createdAt: moment().subtract(11, 'days').toDate(),
    name: 'Code',
    order: 3,
    color: 'orange',
    metrics: [
      {
        createdAt: moment().subtract(11, 'days').toDate(),
        name: 'GitHub contributions',
        isSnapshot: false,
        isDecreasing: false,
        weight: 70,
        reports: [...Array(10).keys()].map((i) => ({
          createdAt: moment().subtract(i, 'days').toDate(),
          date: moment().subtract(i, 'days').toDate(),
          value: Math.floor(Math.random() * 10),
        })),
      },
    ],
  },
]
