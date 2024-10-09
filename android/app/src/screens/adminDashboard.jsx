import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';

const AdminDashboard = ({navigation}) => {
  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  // Function to toggle sidebar visibility
  // const toggleSidebar = () => {
  //   setSidebarVisible(!isSidebarVisible);
  // };

  // Function to fetch user info from the backend using the id from token
  const fetchAdminDetails = async adminId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `http://192.168.1.5:5000/api/admin/get-details/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('====================================');
      console.log(response,'response admin');
      console.log('====================================');
      if (response.status === 200) {
        setUserName(response.data.adminName || 'Admin'); // Assuming the user's name or other details are returned
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
    }
  };

  // fetch all users
  const getAllUsers = async () => {
    try {
      const response = await axios.get(`http://192.168.1.5:5000/api/allUsers`);

      console.log(response.data, 'response data**************************');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching all users :', error);
    }
  };

  // Function to decode token and get user info
  const decodeToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const decodedToken = jwtDecode(token);

        console.log('====================================');
        console.log(decodedToken,"decodeed token for admin");
        console.log('====================================');

        if (decodedToken.id) {
          fetchAdminDetails(decodedToken.id); // Fetch user details based on the userId from the token
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  useEffect(() => {
    decodeToken(); // Decode token and fetch user info on component mount
  }, []);


  // Update time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format time in 12-hour format with AM/PM
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedHours = String(hours % 12 || 12).padStart(2, '0'); // Pad hours with 0 if less than 10
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const periodic = hours < 12 ? 'AM' : 'PM';
      setPeriod(periodic);
      setTime(`${formattedHours}:${formattedMinutes}`);

      // Format date as Monday, May 23, 2024
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      setDate(now.toLocaleDateString(undefined, options));
    };

    const intervalId = setInterval(updateDateTime, 1000); // Update every second
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  // Function to calculate attendance stats
  const calculateAttendanceStats = logs => {
    let totalWorkingDays = 0;
    let totalLeaves = 0;
    let totalAbsents = 0;
    let totalPresent = 0;

    logs.forEach(log => {
      const status = log.status; // e.g., "IN", "Absent", "Leave"

      if (status === 'IN') {
        totalPresent += 1;
        totalWorkingDays += 1; // Assuming present days are working days
      } else if (status === 'Leave') {
        totalLeaves += 1;
      } else if (status === 'Absent') {
        totalAbsents += 1;
      } else {
        totalWorkingDays += 1; // You can handle additional status logic here
      }
    });

    return {
      totalWorkingDays,
      totalLeaves,
      totalAbsents,
      totalPresent,
    };
  };

  const fetchAttendance = async (year, month) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const responseData = await axios.get(
        'http://192.168.1.5:5000/api/attendance/getAttendance',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {month, year},
        },
      );

      const logs = responseData.data;

      console.log(logs, 'logs feteched ##########');
      // Process attendance logs to calculate statistics
      const stats = calculateAttendanceStats(logs);
      console.log(stats, 'stats$$$$$$$$$$$$$$$$');

      setAttendanceStats(stats); // Set stats for displaying in the UI
      console.log(attendanceStats, 'attendance stats%%%%%%%%%%%%%');

      setAttendance(logs);

      console.log(attendance, 'attendance!!!!!!!!!!!!!');
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch attendance logs');
    }
  };
  // Fetch attendance logs for the current month
  useEffect(() => {
    const today = new Date();
    fetchAttendance(today.getFullYear(), today.getMonth() + 1); // Current month
    getAllUsers();
  }, []);

  useEffect(() => {
    // Simulating data loading (remove this in real application)
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after data is loaded
    }, 1000); // Adjust the timeout duration based on actual loading time

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1768AC" />
        </View>
      ) : (
        <SafeAreaView>
          <ScrollView>
            <LinearGradient colors={['#f4f5f7', '#E9E4F0']} style={{flex: 1}}>
              <View style={{padding: 12}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <MaterialIcon name="leaderboard" size={24} color="black" />
                  {/* chart-simple */}
                  <Text style={{fontSize: 16, fontWeight: '600'}}>
                    Employee Managament System
                  </Text>
                  <Icon name="lock" size={24} color="black" />
                </View>

                {/* grettings */}
                <View
                  style={{
                    marginTop: 20,
                    width: '100%', // Full width
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      backgroundColor: '#360568',
                      padding: 12,
                      borderRadius: 6,
                      opacity: 0.9,
                      width: '100%', // Full width
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          marginTop: 7,
                          fontWeight: '700',
                          fontSize: 18,
                          color: '#fff',
                          opacity: 0.8,
                        }}>
                        Hii,
                      </Text>
                      <Text
                        style={{
                          marginTop: 7,
                          fontSize: 20,
                          fontWeight: '700',
                          color: '#fff',
                        }}>
                        {userName}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'column',
                        padding: 8,
                        borderRadius: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}>
                        <Text
                          style={{
                            marginTop: 4,
                            fontSize: 30,
                            fontWeight: '700',
                            color: '#fff',
                            letterSpacing: 4,
                          }}>
                          {time}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontSize: 17,
                            fontWeight: '700',
                            color: '#fff',
                          }}>
                          {period}
                        </Text>
                      </View>
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 18,
                          fontWeight: '700',
                          color: '#fff',
                          opacity: 0.8,
                        }}>
                        {date}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* attendace mark && employee list */}
                <View
                  style={{
                    marginTop: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                  }}>
                  <Pressable
                    onPress={() =>
                      navigation.replace('attendanceReport', {
                        report: attendance,
                      })
                    }
                    style={{
                      backgroundColor: '#D3CCE3',
                      padding: 12,
                      borderRadius: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                    }}>
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <MaterialIcon name="people" size={24} color="black" />
                    </View>
                    <Text style={{marginTop: 7, fontWeight: '600'}}>
                    Today Attendance
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => navigation.replace('calendar')}
                    style={{
                      backgroundColor: '#D3CCE3',
                      padding: 12,
                      borderRadius: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                    }}>
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <MaterialIcon name="people" size={24} color="black" />
                    </View>
                    <Text style={{marginTop: 7, fontWeight: '600'}}>
                      Employee List
                    </Text>
                  </Pressable>
                </View>

                {/* analaytics */}
                <View
                  style={{
                    marginTop: 20,
                    backgroundColor: '#fafafa',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderRadius: 7,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                    {/* working days */}
                    <View
                      style={{
                        backgroundColor: '#f79d00',
                        borderRadius: 6,
                        padding: 12,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        flex: 1,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          flex: 1,
                        }}>
                        <View
                          style={{
                            width: 35,
                            height: 35,
                            borderRadius: 7,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <MaterialCommunityIcons
                            name="calendar"
                            size={24}
                            color="black"
                          />
                        </View>

                        <Text
                          style={{
                            marginTop: 7,
                            fontWeight: '700',
                            textAlign: 'center',
                          }}>
                          Total Days
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          flex: 1,
                        }}>
                        <Text
                          style={{
                            marginTop: 2,
                            fontWeight: 'bold',
                            fontSize: 27,
                          }}>
                          {attendanceStats.totalWorkingDays < 10
                            ? `0${attendanceStats.totalWorkingDays}`
                            : attendanceStats.totalWorkingDays}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontWeight: '700',
                          }}>
                          Working Days
                        </Text>
                      </View>
                    </View>

                    {/* leave*/}
                    <View
                      style={{
                        backgroundColor: '#ABCABA',
                        borderRadius: 6,
                        padding: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          flex: 1,
                        }}>
                        <View
                          style={{
                            width: 35,
                            height: 35,
                            borderRadius: 7,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <MaterialCommunityIcons
                            name="briefcase-off"
                            size={24}
                            color="black"
                          />
                        </View>

                        <Text
                          style={{
                            marginTop: 7,
                            fontWeight: '700',
                            textAlign: 'center',
                          }}>
                          Leave
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          flex: 1,
                          marginTop:6
                        }}>
                        <Text
                          style={{
                            marginTop: 2,
                            fontWeight: 'bold',
                            fontSize: 27,
                          }}>
                          {attendanceStats.totalLeaves < 10
                            ? `0${attendanceStats.totalLeaves}`
                            : attendanceStats.totalLeaves}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontWeight: '700',
                          }}>
                          On Leave
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 2nd row */}
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                    {/* absents */}
                    <View
                      style={{
                        backgroundColor: '#D3CCE3',
                        borderRadius: 6,
                        padding: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          flex: 1,
                        }}>
                        <View
                          style={{
                            width: 35,
                            height: 35,
                            borderRadius: 7,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <MaterialCommunityIcons
                            name="account-cancel"
                            size={24}
                            color="black"
                          />
                        </View>

                        <Text
                          style={{
                            marginTop: 7,
                            fontWeight: '700',
                            textAlign: 'center',
                          }}>
                          Absents
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          flex: 1,
                        }}>
                        <Text
                          style={{
                            marginTop: 2,
                            fontWeight: 'bold',
                            fontSize: 27,
                          }}>
                          {attendanceStats.totalLeaves < 10
                            ? `0${attendanceStats.totalLeaves}`
                            : attendanceStats.totalLeaves}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontWeight: '700',
                          }}>
                          On Absent
                        </Text>
                      </View>
                    </View>
                    {/* users */}
                    <View
                      style={{
                        backgroundColor: '#bdc3c7',
                        borderRadius: 6,
                        padding: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          flex: 1,
                        }}>
                        <View
                          style={{
                            width: 35,
                            height: 35,
                            borderRadius: 7,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <MaterialIcon name="people" size={24} color="black" />
                        </View>

                        <Text
                          style={{
                            marginTop: 7,
                            fontWeight: '700',
                            textAlign: 'center',
                          }}>
                          Employee
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          flex: 1,
                          marginTop: 10,
                        }}>
                        <Text
                          style={{
                            marginTop: 2,
                            fontWeight: 'bold',
                            fontSize: 27,
                          }}>
                          {allUsers.length < 10
                            ? `0${allUsers.length}`
                            : allUsers.length}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontWeight: '700',
                          }}>
                          Total Employee
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* other important links */}
                <View
                  style={{
                    marginTop: 20,
                    backgroundColor: 'white',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderRadius: 7,
                  }}>
                  <Pressable
                    style={{
                      backgroundColor: '#BE93C5',
                      borderRadius: 6,
                      padding: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 10,
                    }}>
                    <View
                      style={{
                        padding: 7,
                        width: 45,
                        height: 45,
                        borderRadius: 7,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <MaterialCommunityIcons name="newspaper" size={25} />
                    </View>
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '600',
                        flex: 1,
                      }}>
                      Employee List
                    </Text>
                    <View
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 7,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <MaterialIcon
                        name="chevron-right"
                        size={24}
                        color="black"
                      />
                    </View>
                  </Pressable>
                  <Pressable
                    style={{
                      backgroundColor: '#BE93C5',
                      borderRadius: 6,
                      padding: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 10,
                    }}>
                    <View
                      style={{
                        padding: 7,
                        width: 45,
                        height: 45,
                        borderRadius: 7,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {/* <Octicons name="repo-pull" size={24} color="black" /> */}
                      <MaterialIcon
                        name="chevron-right"
                        size={24}
                        color="black"
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '600',
                        flex: 1,
                      }}>
                      Summary Report
                    </Text>
                    <View
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 7,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {/* <Entypo name="chevron-right" size={24} color="black" /> */}
                      <MaterialIcon
                        name="chevron-right"
                        size={24}
                        color="black"
                      />
                    </View>
                  </Pressable>
                  <Pressable
                    style={{
                      backgroundColor: '#BE93C5',
                      borderRadius: 6,
                      padding: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 10,
                    }}>
                    <View
                      style={{
                        padding: 7,
                        width: 45,
                        height: 45,
                        borderRadius: 7,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {/* <Octicons name="report" size={24} color="black" /> */}
                      <MaterialIcon
                        name="chevron-right"
                        size={24}
                        color="black"
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '600',
                        flex: 1,
                      }}>
                      All Generate Reports
                    </Text>
                    <View
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 7,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {/* <Entypo name="chevron-right" size={24} color="black" /> */}
                      <MaterialIcon
                        name="chevron-right"
                        size={24}
                        color="black"
                      />
                    </View>
                  </Pressable>
                  <Pressable
                    style={{
                      backgroundColor: '#BE93C5',
                      borderRadius: 6,
                      padding: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 10,
                    }}>
                    <View
                      style={{
                        padding: 7,
                        width: 45,
                        height: 45,
                        borderRadius: 7,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {/* <Ionicons name="people" size={24} color="black" /> */}
                      <MaterialIcon
                        name="chevron-right"
                        size={24}
                        color="black"
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '600',
                        flex: 1,
                      }}>
                      Overtime Employees
                    </Text>
                    <View
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 7,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {/* <Entypo name="chevron-right" size={24} color="black" /> */}
                      <MaterialIcon
                        name="chevron-right"
                        size={24}
                        color="black"
                      />
                    </View>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Full height to center loader
  },
});
export default AdminDashboard;
