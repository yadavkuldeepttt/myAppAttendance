import React, {useEffect, useState} from 'react';
import {View, Text, Button, StyleSheet, Alert, TouchableOpacity, Modal} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import AttendanceCalendar from '../components/attendanceCalendar';

const HomeScreen = ({navigation}) => {
  const [userName, setUserName] = useState('');
  const [isSidebarVisible, setSidebarVisible] = useState(false);


  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };


  // Function to fetch user info from the backend using the id from token
  const fetchUserDetails = async userId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `http://192.168.1.5:5000/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setUserName(response.data.username || 'User'); // Assuming the user's name or other details are returned
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Function to decode token and get user info
  const decodeToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const decodedToken = jwtDecode(token);

        if (decodedToken.id) {
          fetchUserDetails(decodedToken.id); // Fetch user details based on the userId from the token
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };


  useEffect(() => {
    decodeToken(); // Decode token and fetch user info on component mount
  }, []);

    // Function to handle logout
    const handleLogout = async () => {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userName}!</Text>
      <AttendanceCalendar />
        {/* Sidebar Toggle Button */}
        <TouchableOpacity style={styles.sidebarButton} onPress={toggleSidebar}>
        <Text style={styles.sidebarButtonText}>Menu</Text>
      </TouchableOpacity>

      {/* Sidebar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSidebarVisible}
        onRequestClose={toggleSidebar}
      >
        <View style={styles.sidebarContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleSidebar}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.sidebarTitle}>Navigation</Text>
          <TouchableOpacity style={styles.sidebarItem} onPress={() => navigation.navigate('SomeScreen')}>
            <Text style={styles.sidebarItemText}>Some Screen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} onPress={handleLogout}>
            <Text style={styles.sidebarItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,

    color: 'red',
    marginVertical: 20,
  },
  attendance: {
    fontSize: 18,
    marginBottom: 10,
  },
  sidebarButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#007bff', // Button background color
    padding: 10,
    borderRadius: 5,
  },
  sidebarButtonText: {
    color: '#fff', // Button text color
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff', // Close button color
  },
  sidebarTitle: {
    fontSize: 24,
    color: '#fff', // Sidebar title color
    marginBottom: 20,
  },
  sidebarItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444', // Divider color
  },
  sidebarItemText: {
    fontSize: 18,
    color: '#fff', // Sidebar item text color
  },
});

export default HomeScreen;
