export function prepareUsersGroups(users) {
  const usersGroups = {
    required: { name: 'Requests', users: [], description: 'users waiting for the decision to join the team' },
    invited: { name: 'Invited', users: [], description: 'users who has not accepted the invitation to the team' },
    rejected: { name: 'Rejected', users: [], description: 'users who rejected the team participation' },
    accepted: { name: 'Teammates', users: [] },
  };

  if (users.length) {
    users.forEach((user) => {
      if (user.status === 'Requested') {
        usersGroups.required.users.push(user);
      }
      if (user.status === 'Invited' || user.status === 'Reinvited') {
        usersGroups.invited.users.push(user);
      }
      if (user.status === 'Rejected') {
        usersGroups.rejected.users.push(user);
      }
      if (user.status === 'owner' || user.status === 'Accepted') {
        usersGroups.accepted.users.push(user);
      }
    });
  }

  return usersGroups;
}
