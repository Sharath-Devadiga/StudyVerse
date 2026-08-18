export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  username: true,
  avatar: true,
  departmentId: true,
  universityId: true,
  createdAt: true,
} as const;

export const safeUserWithRelationsSelect = {
  ...safeUserSelect,
  department: {
    select: {
      id: true,
      name: true,
      universityId: true,
      university: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  university: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;
