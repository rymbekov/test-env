import React from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';
import BrandedLogo from './BrandedLogo';

/**
 * Logo
 * @param {Object} props
 * @param {string} props.src
 * @param {string} props.username
 * @param {number} props.size
 * @param {boolean} props.avatarPicsio
 * @param {string} props.className
 * @returns {JSX}
 */
export default function Logo({ handleLogoClick, additionalClass }) {
  const { appBrandedLogoEnable, logoUrl, accentColor } = useSelector((state) => state.user.team);
  const { teamName } = useSelector((state) => state.user.team.policies);
  const { branding: brandingAllowed } = useSelector((state) => state.user.subscriptionFeatures);

  const brandedLogoStyle = {};
  if (accentColor) {
    brandedLogoStyle.backgroundColor = accentColor;
  }

  return (
    <>
      {brandingAllowed && appBrandedLogoEnable && logoUrl ? (
        <Button
          id="button-logo"
          additionalClass={additionalClass}
          onClick={handleLogoClick}
          style={brandedLogoStyle}
        >
          <BrandedLogo src={logoUrl} alt={teamName} />
        </Button>
      ) : (
        <Button
          id="button-logo"
          icon="logoPicsio"
          additionalClass={additionalClass}
          onClick={handleLogoClick}
        />
      )}
    </>
  );
}
