import React from 'react';
import type { IdentityHeaderProps } from './IdentityHeader.types';
import { Header } from './Header.component';
import { Avatar } from '../Avatar';
import { devWarn } from '../../utils';

/**
 * `Header` preconfigured for the "this page is about one person or entity"
 * shape - an avatar beside the name, supporting facts below it, actions on
 * the end - which account and profile pages share. Settings-style pages want
 * a plain `Header` instead; they have no identity to lead with.
 *
 * Deliberately thin: it pins `variant="hero"`, types the avatar so consumers
 * don't have to import `Avatar` to fill the slot, and gives the shape a name
 * worth discovering. Everything else is `Header`.
 */
export const IdentityHeader: React.FC<IdentityHeaderProps> = ({
  avatar,
  media,
  variant = 'hero',
  className = '',
  ...rest
}) => {
  if (avatar && media) {
    devWarn(
      'identity-header-avatar-and-media',
      'IdentityHeader received both `avatar` and `media`. `media` takes precedence - drop `avatar` to silence this.',
    );
  }

  const resolvedMedia = media ?? (avatar ? <Avatar size="lg" {...avatar} /> : undefined);

  return (
    <Header
      {...rest}
      variant={variant}
      media={resolvedMedia}
      className={['eidos-identity-header', className].filter(Boolean).join(' ')}
    />
  );
};
