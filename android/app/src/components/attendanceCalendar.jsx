import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Alert,
  Modal,
  Button,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {PermissionsAndroid, Platform} from 'react-native';
const includeExtra = true;
// Your OpenCage API key
const API_KEY = '45ea3b0b5c87452bbf186476a4bc8542'; // Replace this with your API key

// Function to get the location based on latitude and longitude
const getLocationName = async (latitude, longitude) => {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`;

  try {
    const response = await axios.get(url);

    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const location = response.data.results[0].formatted; // Get the formatted address
      console.log('Location:', location);
      return location;
    } else {
      console.log('No results found for the coordinates.');
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
  }
};

const AttendanceCalendar = ({navigation}) => {
  const [response, setResponse] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [locationNames, setLocationNames] = useState({}); // Store location names for each log
  const [attendanceStats, setAttendanceStats] = useState([]);
  // Add separate state for handling time
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [workedHours, setWorkedHours] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [location, setLocation] = useState({latitude: null, longitude: null});
  const todayDate = new Date().toISOString().split('T')[0];


  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location to log attendance.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          return true;
        } else {
          console.log('Location permission denied');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // iOS permissions are handled automatically
      return true;
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission granted');
        } else {
          console.log('Camera permission denied');
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const onButtonPress = useCallback(async options => {
    try {
      console.log('Requesting camera permission...');
      await requestCameraPermission(); // Request permission before launching the camera

      console.log('Launching camera...');
      const responseImage = await ImagePicker.launchCamera(options);
      if (responseImage.didCancel) {
        console.log('User cancelled image picker');
      } else if (responseImage.error) {
        console.log('ImagePicker Error: ', responseImage.error);
      } else if (responseImage.assets) {
        setResponse(responseImage);
        // Navigate to the "selfie" screen with the captured image data
        navigation.replace('selfie', {assets: responseImage.assets});

        // Set logAttendance in navigation options for selfie screen
        navigation.navigate.setOptions({logAttendance});
        console.log('ImagePicker response:', responseImage);
      }
    } catch (error) {
      console.error('Error launching camera:', error);
    }
  }, []);

  // Fetch user location
  const getCurrentLocation = async statuses => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('Permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        console.log('Location fetched:', {latitude, longitude});
        // Proceed to save attendance after location is fetched
        try {
          // Save attendance after location is fetched
          if (status === 'IN') {
            await saveAttendanceWithSelfie(statuses);
          } else {
            await saveAttendance(statuses);
          }
        } catch (error) {
          console.error('Error saving attendance:', error);
        }
      },
      error => {
        console.error('Error fetching location:', error);
        Alert.alert('Error', 'Could not fetch location');
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
  };

  let logAttendance = async statuses => {
    console.log(statuses, 'statuses');

    console.log('Entering logAttendance');
    setStatus(statuses);
    setIsLoadingLocation(true); // Start showing loading

    // Get current location for statuses other than 'IN'
    if (statuses === 'IN') {
      console.log('Fetching current location...');
      getCurrentLocation(statuses); // Pass the status to the function
      // await saveAttendanceWithSelfie(statuses);
    } else {
      console.log('Fetching current location...');
      getCurrentLocation(statuses); // Pass the status to the function
      // Log attendance immediately for 'IN' status
      // await saveAttendance(statuses);
    }
  };

  const saveAttendanceWithSelfie = async statuses => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      // Prepare form data
      let selfieFile; // Get the file, e.g., from image picker
      const formData = new FormData();
      formData.append('status', statuses);
      formData.append('selfie', selfieFile ? selfieFile : null);
      // Append selfie file data
      formData.append('selfie', {
        uri: response.assets[0].uri,
        type: response.assets[0].type, // Mime type of the image
        name: response.assets[0].fileName, // File name
      });
      formData.append('latitude', location?.latitude);
      formData.append('longitude', location?.longitude);

      console.log('Form Data:selfie', {
        statuses,
        location,
      });

      // Make the POST request to log attendance
      const responseData = await axios.post(
        'http://192.168.1.5:5000/api/attendance/log',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Response:', responseData.data);
      // Update markedDates based on the status
      // Update markedDates based on the status
      setAttendanceLogs(prevLogs => {
        const newLogs = {
          ...prevLogs,
          [selectedDate]: {
            marked: true,
            selected: true, // Indicate that the date is selected
            selectedColor:
              statuses === 'OUT'
                ? 'blue' // Blue for OUT
                : statuses === 'IN'
                ? 'green' // Green for IN
                : statuses === 'Absent'
                ? 'red' // Red for Absent
                : statuses === 'Leave'
                ? 'orange' // Orange for Leave
                : 'rgba(255, 165, 0, 0.5)', // Default for other cases
            statuses,
          },
        };
        return newLogs;
      });

      console.log(attendanceLogs, 'attendanceLogs');

      setModalVisible(false);
      console.log(`Success, Attendance ${statuses} logged successfully`);
      const today = new Date();
      fetchAttendance(today.getFullYear(), today.getMonth() + 1); // Current month
      Alert.alert('Success', `Attendance ${statuses} logged successfully`);
    } catch (error) {
      console.error('Error logging attendance:', error);
      if (error.response) {
        console.log('Error response:', error.response.data);
        console.log('Error status:', error.response.status);
        console.log('Error headers:', error.response.headers);
      } else if (error.request) {
        console.log('Error request:', error.request);
      } else {
        console.log('Error message:', error.message);
      }
    } finally {
      setIsLoadingLocation(false); // Stop loading after attendance is saved
    }
  };

  // save attendance instead of IN status
  const saveAttendance = async statuses => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      // Prepare form data
      let selfieFile; // Get the file, e.g., from image picker
      const formData = new FormData();
      formData.append('status', statuses);
      formData.append('selfie', selfieFile ? selfieFile : null);

      formData.append('latitude', location?.latitude);
      formData.append('longitude', location?.longitude);

      console.log('Form Data:without selfie', {
        statuses,
        location,
      });

      // Make the POST request to log attendance
      const responseData = await axios.post(
        'http://192.168.1.5:5000/api/attendance/log',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Response:', responseData.data);
      // Update markedDates based on the status
      // Update markedDates based on the status
      setAttendanceLogs(prevLogs => {
        const newLogs = {
          ...prevLogs,
          [selectedDate]: {
            marked: true,
            selected: true, // Indicate that the date is selected
            selectedColor:
              statuses === 'OUT'
                ? 'blue' // Blue for OUT
                : statuses === 'IN'
                ? 'green' // Green for IN
                : statuses === 'Absent'
                ? 'red' // Red for Absent
                : statuses === 'Leave'
                ? 'orange' // Orange for Leave
                : 'rgba(255, 165, 0, 0.5)', // Default for other cases
            statuses,
          },
        };
        return newLogs;
      });

      console.log(attendanceLogs, 'attendanceLogs');

      setModalVisible(false);
      console.log(`Success, Attendance ${statuses} logged successfully`);
      const today = new Date();
      fetchAttendance(today.getFullYear(), today.getMonth() + 1); // Current month
      Alert.alert('Success', `Attendance ${statuses} logged successfully`);
    } catch (error) {
      console.error('Error logging attendance:', error);
      if (error.response) {
        console.log('Error response:', error.response.data);
        console.log('Error status:', error.response.status);
        console.log('Error headers:', error.response.headers);
      } else if (error.request) {
        console.log('Error request:', error.request);
      } else {
        console.log('Error message:', error.message);
      }
    } finally {
      setIsLoadingLocation(false); // Stop loading after attendance is saved
    }
  };

  const onDayPress = day => {
    // Check if the pressed day is today
    if (day.dateString === todayDate) {
      setSelectedDate(day.dateString);
      console.log('Selected date:', day.dateString);
      setModalVisible(true);
    } else {
      Alert.alert('Error!', 'Log attendance only for today date');
      console.log('Date not selectable:', day.dateString);
    }
  };

  const fetchAttendance = async (year, month) => {
    console.log('fetching attendance');

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

      console.log(logs, 'logs feteched **************************');

      setAttendance(logs);

      // Fetch location names for each log
      const locationPromises = logs.map(async log => {
        const locationName = await getLocationName(
          log.location.latitude,
          log.location.longitude,
        );
        return {id: log._id, locationName};
      });

      const locations = await Promise.all(locationPromises);
      const locationMap = locations.reduce((acc, loc) => {
        acc[loc.id] = loc.locationName;
        return acc;
      }, {});
      setLocationNames(locationMap);

      // Initialize variables to store clock-in and clock-out times
      // let foundClockInTime = null;
      // let foundClockOutTime = null;

      // // Process attendance logs to extract clock-in/out times
      // logs.forEach(log => {
      //   const logDate = new Date(log.date).toISOString().split('T')[0]; // Date in YYYY-MM-DD format
      //   console.log(logDate, 'log date');

      //   // Check for today's log
      //   if (logDate === new Date().toISOString().split('T')[0]) {
      //     console.log(log.status, 'log status');

      //     if (log.status === 'IN') {
      //       foundClockInTime = new Date(log.timestamp); // Set clock-in time
      //       console.log(foundClockInTime);
      //     } else if (log.status === 'OUT') {
      //       foundClockOutTime = new Date(log.timestamp); // Set clock-out time
      //       console.log(foundClockOutTime);
      //     }
      //   }
      // });

      // console.log(foundClockInTime);
      // console.log(foundClockOutTime);

      // Set the clock-in and clock-out times in their respective states
      // setClockInTime(foundClockInTime);
      // setClockOutTime(foundClockOutTime);

      // If clock-out is available, calculate total worked hours
      // if (foundClockInTime && foundClockOutTime) {
      //   const workedMilliseconds = foundClockOutTime - foundClockInTime;
      //   const workedHours = Math.floor(workedMilliseconds / (1000 * 60 * 60));
      //   const workedMinutes = Math.floor(
      //     (workedMilliseconds % (1000 * 60 * 60)) / (1000 * 60),
      //   );
      //   setWorkedHours(`${workedHours} hours and ${workedMinutes} minutes`);
      // } else if (foundClockInTime && !foundClockOutTime) {
      //   // If the user is still clocked in, start a countdown from the clock-in time
      //   const updateCountdown = () => {
      //     const currentTime = new Date();
      //     const workedMilliseconds = currentTime - foundClockInTime;
      //     const workedHours = Math.floor(workedMilliseconds / (1000 * 60 * 60));
      //     const workedMinutes = Math.floor(
      //       (workedMilliseconds % (1000 * 60 * 60)) / (1000 * 60),
      //     );
      //     setWorkedHours(`${workedHours} hours and ${workedMinutes} minutes`);
      //   };

      //   // Start the countdown and update every minute
      //   const intervalId = setInterval(updateCountdown, 60000);

      //   // Clear the interval when the user clocks out or the component unmounts
      //   return () => clearInterval(intervalId);
      // }

      // Format the attendance data to match the calendar format
      const formattedLogs = logs.reduce((acc, log) => {
        const date = new Date(log.date).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
        setCurrentDate(date);
        acc[date] = {
          marked: true,
          selectedColor:
            log.status === 'IN'
              ? 'green' // Selected color for 'IN'
              : log.status === 'OUT'
              ? 'blue' // Selected color for 'OUT'
              : log.status === 'Absent'
              ? 'red' // Selected color for 'Absent'
              : log.status === 'Leave'
              ? 'orange' // Selected color for 'Leave'
              : 'rgba(255, 165, 0, 0.5)', // Default selected color

          status: log.status,
        };

        return acc;
      }, {});

      setAttendanceLogs(formattedLogs);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch attendance logs');
    }
  };
  // Fetch attendance logs for the current month
  useEffect(() => {
    const today = new Date();
    fetchAttendance(today.getFullYear(), today.getMonth() + 1); // Current month
  }, []);

  // Dynamically create markedDates object from attendanceLogs
  const markedDates = Object.keys(attendanceLogs).reduce((acc, date) => {
    acc[date] = {
      selected: true,
      marked: true,
      selectedColor: attendanceLogs[date].selectedColor || '#00adf5', // Default to blue if not specified
      selectedDotColor: '#fff',
    };
    return acc;
  }, {});

  // Disable all days except today
  const disabledDaysIndices = [...Array(30).keys()]; // Assuming you want to disable the last 30 days
  const todayIndex = new Date().getDate() - 1; // Get index for today (0-based index)
  disabledDaysIndices.splice(todayIndex, 1); // Remove today from disabled indices

  // Get today's date in 'YYYY-MM-DD' format
  const today = new Date().toISOString().split('T')[0];

  // Check if today's attendance is logged
  const isTodayLogged =
    attendanceLogs[today] &&
    (attendanceLogs[today].status === 'IN' ||
      attendanceLogs[today].status === 'OUT');

      useEffect(() => {
        // Simulating data loading (remove this in real application)
        const timer = setTimeout(() => {
          setLoading(false); // Set loading to false after data is loaded
        }, 1000); // Adjust the timeout duration based on actual loading time
    
        return () => clearTimeout(timer); // Cleanup timer on unmount
      }, []);
    
  return (
    <>
      <View
        style={{padding: 13, backgroundColor: '#1768AC', alignItems: 'center',flexDirection:'row',gap:54 }}>
        <MaterialIcon
          name="chevron-left"
          size={37}
          color="#fff"
          fontWeight="700"
          onPress={() => navigation.navigate('Home', {screen: 'Dashboard'})} // Navigate to "Home" (Tab Navigator), then "Dashboard"
        />

        <Text style={{color: '#fff', fontWeight: '600', textAlign: 'center',fontSize:25,letterSpacing:2.5}}>
          Mark Attendance
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1768AC" />
        </View>
      ) : (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              selectedDayBackgroundColor: '#00adf5', // Color for selected day
              todayTextColor: 'brown', // Color for today's date
              arrowColor: '#00adf5', // Color for navigation arrows
              monthTextColor: '#007aff', // Month title color
              textSectionTitleColor: '#b6c1cd', // Header month text color
              textDayFontSize: 16, // Font size for day numbers
              textMonthFontSize: 20, // Font size for month title
              textDayHeaderFontSize: 14, // Font size for day headers (Sun, Mon, etc.)
              textDayFontFamily: 'Roboto-Regular', // Font family for day numbers
              textMonthFontFamily: 'Roboto-Bold', // Font family for month title
              textDayHeaderFontFamily: 'Roboto-Medium', // Font family for day headers
              dotColor: '#00adf5', // Color for dots marking events
              selectedDotColor: '#fff', // Color for the dot of the selected day
              // Add more styles as needed
            }}
            disabledDaysIndices={disabledDaysIndices} // Disable all except today
            current={todayDate} // Highlight today’s date
          />

          {/* Modal for attendance status selection */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Attendance Status</Text>
                {['IN', 'OUT', 'Absent', 'Leave'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={styles.optionButton}
                    onPress={() => {
                      if (status === 'IN') {
                        getCurrentLocation();
                        setStatus(status);
                        onButtonPress({
                          type: 'capture',
                          saveToPhotos: true,
                          mediaType: 'photo',
                          includeBase64: false,
                          includeExtra: true, // Additional metadata
                        });
                      } else {
                        logAttendance(status); // Log attendance directly
                      }
                      setModalVisible(false);
                    }}>
                    <Text style={styles.optionText}>{status}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.locationContainer}>
            {/* Your main content goes here */}

            {isLoadingLocation && (
              <View style={styles.overlay}>
                <Text style={styles.loadingText}>Fetching location...</Text>
              </View>
            )}
          </View>
{/* 
          {response?.assets && // Showing the image here in the UI
            response.assets.map(({uri}) => (
              <View key={uri} style={styles.imageContainer}>
                <Image resizeMode="cover" style={styles.image} source={{uri}} />
                <Button
                  title="Log Attendance"
                  onPress={() => logAttendance(status)}
                />
              </View>
            ))} */}

          {isTodayLogged ? (
            <>
              <Text style={styles.heading}>Today Attendance</Text>

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
                  {/* check in */}
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
                          name="clock-in"
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
                        Check In
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
                        {clockInTime}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontWeight: '700',
                        }}>
                        On Time
                      </Text>
                    </View>
                  </View>

                  {/* check out*/}
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
                          name="clock-out"
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
                        Check Out
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
                        {clockOutTime}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontWeight: '700',
                        }}>
                        Go Home
                      </Text>
                    </View>
                  </View>
                </View>
                {/* You can add more analytics like total worked hours */}
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Text>Total Hours Worked</Text>
                  <Text>
                    {attendanceLogs[today].totalWorkedHours || 'Calculating...'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            // If today's attendance is not logged, show a placeholder or message
            <Text style={{textAlign:'center'}}>No attendance logged for today</Text>
          )}
        </ScrollView>

        {/* <ScrollView style={styles.showAttendance}>
      {attendance.map((log) => {
        const date = new Date(log.date).toLocaleDateString();
        const statusColor =
          log.status === 'IN' ? 'green' :
          log.status === 'OUT' ? 'blue' :
          log.status === 'Absent' ? 'red' :
          'orange'; // Color coding for each status

        return (
          <View key={log._id} style={[styles.card, { borderColor: statusColor }]}>
            <Text style={styles.dateUi}>Date: {date}</Text>
            <Text style={[styles.statusUi, { color: statusColor }]}>
              Status: {log.status}
            </Text>
            <Text style={styles.locationUi}>
              Location: {locationNames[log._id] || 'Fetching location...'}
            </Text>
          </View>
        );
      })}
    </ScrollView> */}
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
  container: {
    width: '100%',
    flex: 1,
    // backgroundColor: '#f5faff', // Lighter background for better contrast
    padding: 10,
  },
  scrollContainer: {
    paddingBottom: 20, // Add padding to the bottom
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay for modal
  },
  modalContent: {
    width: '80%', // Width percentage for responsive design
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5, // Shadow effect on modal
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold', // Bold title
    color: '#333', // Dark color for better readability
  },
  optionButton: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: '#f45f7', // Primary button color
    width: '100%',
    alignItems: 'center',
    borderColor: '#e0e0e0', // Light border color
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500', // Slightly bolder font
  },
  imageContainer: {
    marginVertical: 24,
    alignItems: 'center',
  },
  image: {
    width: 250, // Increased width for better visibility
    height: 250,
    borderRadius: 15, // Rounded corners for images
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light border color
    marginBottom: 10,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'red', // Background color for the button
    borderRadius: 5, // Rounded corners
    alignItems: 'center', // Center the text
  },
  cancelButtonText: {
    color: 'white', // Text color
    fontSize: 16, // Font size for the button text
    fontWeight: 'bold', // Bold text
  },
  locationContainer: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8', // Light background color
    padding: 30,
    zIndex: 99999999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure it appears above other content
  },
  loadingText: {
    fontSize: 22,
    color: '#fff', // Blue color for loading text
  },
  showAttendance: {
    marginVertical: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
  },
  dateUi: {
    fontSize: 16,
    marginBottom: 8,
  },
  statusUi: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationUi: {
    fontSize: 16,
    marginTop: 8,
  },
});

export default AttendanceCalendar;
