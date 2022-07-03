import { createSelector } from 'reselect';

const getTeammates = state => state.teammates.items;
const getRoles = state => state.roles.items;

export const teammatesSelector = createSelector(
  getTeammates,
  getRoles,
  (teammates, roles) => {
    return teammates.map(teammate => {
      const teammateRole = roles.find(role => role._id === teammate.roleId);
      if (teammateRole && teammateRole.name !== teammate.roleName) {
        const updatedTeammate = { ...teammate };
        updatedTeammate.roleName = teammateRole && teammateRole.name;
        updatedTeammate.isRoleError = teammateRole && teammateRole.error;
        return updatedTeammate;
      }
      return teammate;
    });
  },
);

export default {
  teammatesSelector,
};
