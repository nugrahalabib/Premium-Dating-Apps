import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedScreen from '../screens/FeedScreen';
import MatchScreen from '../screens/MatchScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Definisikan tipe untuk parameter navigasi
export type MainTabParamList = {
  Feed: undefined;
  Matches: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FDF0E0' }, // Contoh styling 'Cozy Coffee'
        tabBarStyle: { backgroundColor: '#FDF0E0' },
        tabBarActiveTintColor: '#6B4F4B',
        tabBarInactiveTintColor: '#B0A191',
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Matches" component={MatchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
