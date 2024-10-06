import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './android/app/src/screens/loginScreen';
import Dashboard from './android/app/src/screens/dashboard'; // Ensure your import is correct
import Profile from './android/app/src/screens/profile';
import AdminLogin from './android/app/src/screens/adminLogin';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ForgotPassword from './android/app/src/screens/forgotPassword';
import AttendanceCalendar from './android/app/src/components/attendanceCalendar';
import SelfieScreen from './android/app/src/screens/selfieScreen';
import AttendanceReport from './android/app/src/screens/attendanceReport';

const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = 'view-dashboard';
        } else if (route.name === 'Profile') {
          iconName = 'account-circle';
        }

        return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
      },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#B0BEC5',
      tabBarStyle: {
        backgroundColor: '#7F7FD5',
        paddingBottom: 10,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      tabBarIconStyle: {
        marginTop: 5,
      },
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={Dashboard}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarBadge: 3, // Add a badge for notification
        tabBarBadgeStyle: {
          backgroundColor: '#FF5252',
          color: '#fff',
          fontWeight:'700',
        },
      }}
    />
    <Tab.Screen
      name="Profile"
      component={Profile}
      options={{
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer initialRouteName="Login">
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLogin} />
        <Stack.Screen name="forgotPassword" component={ForgotPassword} />
        <Stack.Screen name="calendar" component={AttendanceCalendar} />
        <Stack.Screen name="selfie" component={SelfieScreen} />
        <Stack.Screen name="attendanceReport" component={AttendanceReport} />

        {/* <Stack.Screen name="resetPassword" component={AdminLogin} /> */}

        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{headerShown: false}} // Hide the stack header for the tab navigation
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
