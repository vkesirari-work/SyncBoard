export const projects = [
  {
    id: 'syncboard-web',
    name: 'SyncBoard Web',
    status: 'In progress',
    members: 6,
    completion: 68,
    due: 'Jul 18',
  },
  {
    id: 'api-platform',
    name: 'API Platform',
    status: 'Planning',
    members: 4,
    completion: 34,
    due: 'Jul 26',
  },
  {
    id: 'mobile-handoff',
    name: 'Mobile Handoff',
    status: 'Review',
    members: 3,
    completion: 82,
    due: 'Aug 02',
  },
]

export const boardColumns = [
  {
    id: 'todo',
    title: 'Todo',
    tasks: [
      {
        id: 'task-1',
        title: 'Design auth screens and validation states',
        owner: 'Aman',
        priority: 'High',
        comments: 4,
      },
      {
        id: 'task-2',
        title: 'Create workspace invitation flow',
        owner: 'Nisha',
        priority: 'Medium',
        comments: 2,
      },
    ],
  },
  {
    id: 'progress',
    title: 'In progress',
    tasks: [
      {
        id: 'task-3',
        title: 'Build dashboard metrics with realtime updates',
        owner: 'Vikram',
        priority: 'High',
        comments: 8,
      },
      {
        id: 'task-4',
        title: 'Prepare MongoDB project schema',
        owner: 'Riya',
        priority: 'Medium',
        comments: 3,
      },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [
      {
        id: 'task-5',
        title: 'Socket event naming and room strategy',
        owner: 'Karan',
        priority: 'Low',
        comments: 5,
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: 'task-6',
        title: 'Frontend project setup with Vite and React',
        owner: 'Vikram',
        priority: 'Done',
        comments: 1,
      },
    ],
  },
]

export const activity = [
  'Vikram moved dashboard metrics to In progress',
  'Nisha commented on workspace invitation flow',
  'Aman joined SyncBoard Web',
  'Karan updated socket event strategy',
]
