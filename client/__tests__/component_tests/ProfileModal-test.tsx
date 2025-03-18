import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileModal from '@/components/ProfileModal';

const mockUserProfile = {
  photoUrl: 'https://example.com/photo.jpg',
  name: 'John Doe',
  email: 'john.doe@example.com',
  calendars: ['Work', 'Personal'],
};

describe('ProfileModal', () => {
  it('matches the snapshot', () => {
    const { toJSON } = render(
      <ProfileModal
        visible={false}
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
        userProfile={{
          photoUrl: '',
          name: '',
          email: '',
          calendars: [],
        }}
        onSave={function (calendarId: string): void {
          throw new Error('Function not implemented.');
        }}
        onSignOut={function (): void {
          throw new Error('Function not implemented.');
        }}></ProfileModal>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
