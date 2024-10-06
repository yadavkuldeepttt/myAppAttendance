import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, StyleSheet, ActivityIndicator} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useRoute} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


// Helper function to format date and get week name
const formatDate = dateString => {
  const date = new Date(dateString);
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  return date.toLocaleDateString(undefined, options);
};

// Function to get the weekday name
const getWeekdayName = dateString => {
  const date = new Date(dateString);
  const weekdayOptions = {weekday: 'long'};
  return date.toLocaleDateString(undefined, weekdayOptions);
};

const AttendanceReport = ({navigation}) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [loading, setLoading] = useState(true);

  const route = useRoute();

  // Retrieve the report from the route params
  const {report} = route.params;

  useEffect(() => {
    // Simulating data loading (remove this in real application)
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after data is loaded
    }, 1000); // Adjust the timeout duration based on actual loading time

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  useEffect(() => {
    const today = new Date();
    const options = {month: 'long', year: 'numeric'}; // Specify the format for month and year
    const formattedMonthYear = today.toLocaleString('default', options); // Get the formatted month and year

    setFormattedDate(formattedMonthYear); // Set the formatted string
  }, []);

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcon
          name="chevron-left"
          size={37}
          color="#fff"
          fontWeight="700"
          onPress={() => navigation.navigate('Home', {screen: 'Dashboard'})} // Navigate to "Home" (Tab Navigator), then "Dashboard"
        />
        <Text style={styles.headerText}>Attendance Report</Text>
      </View>


      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1768AC" />
        </View>
      ) : (
<>
      <View style={{marginTop: 20}}>
        <Text
          style={{
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 22,
            color: 'black',
          }}>
          {' '}
          {formattedDate}
        </Text>
      </View>
      {/* Attendance Report List */}
      <ScrollView style={styles.showAttendance}>
        {report.map(log => {
          const dateFormatted = formatDate(log.date);
          const weekday = getWeekdayName(log.date);

          // Determine if it's a weekend (Sunday)
          const isWeekend = weekday === 'Sunday';
  // Icon based on status
  let statusIcon;
  switch (log.status) {
    case 'Absent':
      statusIcon = <MaterialCommunityIcons name="account-cancel" size={24} color="#fff" />;
      break;
    case 'Leave':
      statusIcon = <MaterialCommunityIcons name="briefcase-off" size={24} color="#fff" />;
      break;
    case 'IN':
      statusIcon = <MaterialCommunityIcons name="check-in" size={24} color="#fff" />;
      break;
    case 'OUT':
      statusIcon = <MaterialCommunityIcons name="check-out" size={24} color="#fff" />;
      break;
    default:
      statusIcon = <MaterialCommunityIcons name="help-outline" size={24} color="#fff" />;
      break;
  }

          const statusColor =
            log.status === 'IN'
              ? 'green'
              : log.status === 'OUT'
              ? 'blue'
              : log.status === 'Absent'
              ? 'red'
              : isWeekend
              ? 'gray'
              : 'orange'; // Color for weekend or other statuses

          return (
            <View
              key={log._id}
              style={[styles.card, {borderColor: statusColor}]}>
              <View style={{flexDirection:'row',alignItems:'center',gap:15}}>
                <View style={{          width: 45,
                        height: 50,
                        borderRadius: 7,
                        backgroundColor:'#1768AC',
                        alignItems: 'center',
                        justifyContent: 'center',}}>{statusIcon}</View>

                {/* Date and Day of Week */}
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Text style={styles.weekdayUi}>{weekday}</Text>
                  <Text style={styles.dateUi}> {dateFormatted}</Text>
                </View>
              </View>

              {/* Status */}
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 7,
                }}>
                <Text
                  style={[
                    styles.statusUi,
                    {
                      backgroundColor: statusColor,
                      color: '#fff',
                      height: 40,
                      borderColor: statusColor,
                      borderWidth: 1,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center', // Ensure text is centered
                      paddingVertical: 8, // Optional: padding for better spacing
                      paddingHorizontal: 10,
                    },
                  ]}>
                  {isWeekend ? 'Weekend' : log.status}
                </Text>
                {/* <Text>9:43 AM To 5:00 PM</Text> */}
                {/* Show clock-in/clock-out times only for IN/OUT */}
                {log.status === 'Leave' && (
                  <Text style={styles.timeUi}>
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                  </Text>
                )}
                {log.status === 'Absent' && (
                  <Text style={styles.timeUi}>
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
      </>
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
  header: {
    padding: 13,
    backgroundColor: '#1768AC',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 40,
  },
  headerText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 25,
    letterSpacing: 2.5,
  },
  showAttendance: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateUi: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weekdayUi: {
    fontSize: 15,
    marginBottom: 8,
  },
  statusUi: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeUi: {
    fontSize: 17,
    marginTop: 8,
    color: '#555',
  },
});

export default AttendanceReport;
