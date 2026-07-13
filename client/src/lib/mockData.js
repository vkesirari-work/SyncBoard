export const projects = [
  {
    id: 'main-floor',
    name: 'Main Gym Floor',
    status: 'Open',
    members: 128,
    completion: 86,
    due: 'Today',
  },
  {
    id: 'personal-training',
    name: 'Personal Training',
    status: 'Busy',
    members: 34,
    completion: 72,
    due: '6 sessions',
  },
  {
    id: 'membership-desk',
    name: 'Membership Desk',
    status: 'Follow up',
    members: 19,
    completion: 58,
    due: '12 renewals',
  },
]

export const boardColumns = [
  {
    id: 'new',
    title: 'New leads',
    tasks: [
      {
        id: 'task-1',
        title: 'Call Rohit about annual membership trial',
        owner: 'Aman',
        priority: 'High',
        comments: 4,
      },
      {
        id: 'task-2',
        title: 'Share transformation package with Neha',
        owner: 'Nisha',
        priority: 'Medium',
        comments: 2,
      },
    ],
  },
  {
    id: 'active',
    title: 'Active members',
    tasks: [
      {
        id: 'task-3',
        title: 'Update Vikram monthly plan and trainer notes',
        owner: 'Vikram',
        priority: 'High',
        comments: 8,
      },
      {
        id: 'task-4',
        title: 'Add morning batch attendance for Riya',
        owner: 'Riya',
        priority: 'Medium',
        comments: 3,
      },
    ],
  },
  {
    id: 'due',
    title: 'Payment due',
    tasks: [
      {
        id: 'task-5',
        title: 'Send renewal reminder to Karan',
        owner: 'Karan',
        priority: 'High',
        comments: 5,
      },
    ],
  },
  {
    id: 'renewed',
    title: 'Renewed',
    tasks: [
      {
        id: 'task-6',
        title: 'Mark Meera yearly membership as renewed',
        owner: 'Vikram',
        priority: 'Done',
        comments: 1,
      },
    ],
  },
]

export const activity = [
  'Vikram renewed Meera yearly membership',
  'Nisha added a note for Neha trial follow-up',
  'Aman checked in 18 morning batch members',
  'Karan payment reminder moved to Payment due',
]
