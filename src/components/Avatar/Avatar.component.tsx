import React, { useState } from 'react';
import { User } from 'lucide-react';
import type { AvatarProps, AvatarGroupProps, AvatarColor } from './Avatar.types';
import './Avatar.scss';

// ============================================================================
// Constants
// ============================================================================

const AVATAR_COLORS: AvatarColor[] = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
];

// ============================================================================
// Helpers
// ============================================================================

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAutoColor(name: string): AvatarColor {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

// ============================================================================
// Avatar
// ============================================================================

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  color,
  shape = 'circle',
  fallback,
  className,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const showImage = !!src && !imgError;
  const showInitials = !showImage && !!name;
  const showFallback = !showImage && !showInitials;

  const resolvedColor: AvatarColor = color ?? (name ? getAutoColor(name) : 'gray');

  const classes = [
    'eidos-avatar',
    `eidos-avatar--${size}`,
    `eidos-avatar--${shape}`,
    showInitials && `eidos-avatar--${resolvedColor}`,
    onClick && 'eidos-avatar--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {showImage && (
        <img
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          className="eidos-avatar-image"
          onError={() => setImgError(true)}
        />
      )}
      {showInitials && <span className="eidos-avatar-initials">{getInitials(name!)}</span>}
      {showFallback &&
        (fallback ?? <User className="eidos-avatar-fallback-icon" aria-hidden="true" />)}
    </div>
  );
};

// ============================================================================
// AvatarGroup
// ============================================================================

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ children, max, size, className }) => {
  const childArray = React.Children.toArray(children) as React.ReactElement<AvatarProps>[];
  const visibleAvatars = max !== undefined ? childArray.slice(0, max) : childArray;
  const overflow = childArray.length - visibleAvatars.length;

  return (
    <div className={['eidos-avatar-group', className].filter(Boolean).join(' ')}>
      {visibleAvatars.map((child, i) => (
        <div key={i} className="eidos-avatar-group-item">
          {React.cloneElement(child, { size: size ?? child.props.size })}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={[
            'eidos-avatar',
            `eidos-avatar--${size ?? 'md'}`,
            'eidos-avatar--circle',
            'eidos-avatar--overflow',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="eidos-avatar-initials">+{overflow}</span>
        </div>
      )}
    </div>
  );
};
