/* eslint-disable */
export const commits = [
    {
        hash: 'abc',
        msg: 'A commit message',
        is_valid: false,
        defects: ['service', 'syntax'],
        repository_id: 1,
    },
    {
        hash: 'def',
        msg: 'I am fixing something',
        is_valid: true,
        defects: ['configuration_data', 'security'],
        repository_id: 1,
    },
    {
        hash: 'ghi',
        msg: 'Fixing docs',
        is_valid: true,
        defects: ['documentation'],
        repository_id: 1,
    },
    {
        hash: 'lmn',
        msg: 'No tags',
        is_valid: true,
        defects: [],
        repository_id: 1,
    },
    {
        hash: 'awe',
        msg: 'No tags',
        is_valid: false,
        defects: [],
        repository_id: 1,
    },
    {
        hash: 'awe12',
        msg: 'No tags',
        is_valid: false,
        defects: [],
        repository_id: 1,
    },
    {
        hash: 'awe312',
        msg: 'No tags',
        is_valid: false,
        defects: [],
        repository_id: 1,
    },
    {
        hash: 'awe4313',
        msg: 'No tags',
        is_valid: true,
        defects: [],
        repository_id: 1,
    },
    {
        hash: '123',
        msg: 'No tags',
        is_valid: false,
        defects: [],
        repository_id: 2,
    },
    {
        hash: '234',
        msg: 'No tags',
        is_valid: true,
        defects: [],
        repository_id: 2,
    },
    {
        hash: '345',
        msg: 'No tags',
        is_valid: true,
        defects: [],
        repository_id: 2,
    },
];

export const tags = [
    'configuration_data',
    'documentation',
    'idempotency',
    'syntax',
    'security',
    'service'
]