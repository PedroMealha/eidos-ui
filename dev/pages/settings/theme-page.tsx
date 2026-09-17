import React from 'react';
import { ThemeEditor } from 'eidos-ui';
import { SettingsLayout } from './settings-layout';

export const ThemePage: React.FC = () => (
  <SettingsLayout>
    <ThemeEditor />
  </SettingsLayout>
);
