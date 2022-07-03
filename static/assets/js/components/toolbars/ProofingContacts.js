import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import { Popper, IconButton } from '@picsio/ui';
import { CloseIcon } from '@picsio/ui/dist/icons';
import useToggleListener from '@picsio/ui/dist/utils/hooks/useToggleListener';

import { capitalizeFirstLetter } from '../../shared/utils';

const socials = [
  'phone',
  'blogUrl',
  'facebookUrl',
  'instagramUrl',
  'twitterUrl',
];

const ProofingContacts = (props) => {
  const { user, permissions } = props;
  const [ref, { open, toggle }] = useToggleListener({ eventType: 'click' });
  const {
    contacts,
    displayName,
    email,
  } = user;

  return (
    <div className="proofingContacts__wrapper">
      <button
        ref={ref}
        className={clsx('proofingContacts__toggler', {
          'proofingContacts__toggler--openned': open,
        })}
        type="button"
      >
        Contacts
      </button>
      <Popper
        target={ref}
        className="proofingContactsPopper"
        isOpen={open}
        onClose={toggle}
        placement="bottom-end"
        offset={[0, 30]}
        hide={false}
        arrow
        outsideClickListener
      >
        <>
          <div className="proofingContactsPopper__close">
            <IconButton onClick={toggle} color="inherit" size="inherit">
              <CloseIcon />
            </IconButton>
          </div>
          <div className="proofingContacts">
            <div className="proofingContacts__content">
              <div className="proofingContacts__row proofingContacts__row--displayName">
                {displayName}
              </div>
              <If condition={contacts}>
                <div className="proofingContacts__row proofingContacts__row--contacts">
                  {contacts}
                </div>
              </If>
              <div className="proofingContacts__row proofingContacts__row--social">
                {
                  socials.map((social) => {
                    const name = social.replace('Url', '');
                    const capitalized = capitalizeFirstLetter(name);
                    const value = user[social];
                    const isAllowed = permissions[social];

                    if (!isAllowed || !value) {
                      return null;
                    }
                    return (
                      <div key={social} className={clsx('proofingContacts__row', `proofingContacts__row--${social}`)}>
                        {`${capitalized}: ${value}`}
                      </div>
                    )
                  })
                }
              </div>
              <If condition={email && permissions.email}>
                <div className="proofingContacts__row proofingContacts__row--email">
                  {email}
                </div>
              </If>
            </div>
          </div>
        </>
      </Popper>
    </div>
  );
}

ProofingContacts.propTypes = {
  user: PropTypes.shape({
    about: PropTypes.string,
    blogUrl: PropTypes.string,
    contacts: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string,
    facebookUrl: PropTypes.string,
    instagramUrl: PropTypes.string,
    phone: PropTypes.string,
    twitterUrl: PropTypes.string,
  }).isRequired,
  permissions: PropTypes.shape({
    blogUrl: PropTypes.bool,
    email: PropTypes.bool,
    facebookUrl: PropTypes.bool,
    instagramUrl: PropTypes.bool,
    phone: PropTypes.bool,
    twitterUrl: PropTypes.bool,
  }).isRequired,
};

export default ProofingContacts;
