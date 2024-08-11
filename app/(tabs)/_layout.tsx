import React from 'react';
import { View } from 'react-native';
import RecorderComponent from '../../components/RecorderComponent';

const ExploreScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <RecorderComponent />
    </View>
  );
};

export default ExploreScreen;
