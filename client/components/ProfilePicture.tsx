import { Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProfilePictureProps {
  isLoggedIn: boolean;
  userInfo: {
    picture?: string;
  } | null;
  styles: {
    profileImage: {
      width: number;
      height: number;
      borderRadius: number;
      borderWidth: number;
      borderColor: string;
    };
  };
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ isLoggedIn, userInfo, styles }) => {
  if (isLoggedIn && userInfo) {
    if (userInfo?.picture) {
      return <Image source={{ uri: userInfo.picture }} style={styles.profileImage} />;
    } else {
      return <Feather user="user-circle" size={32} color="#852C3A" />;
    }
  } else {
    return <Feather name="plus-circle" size={32} color="#852C3A" />;
  }
};

export default ProfilePicture;
