import React from 'react';
import {View, Image, Button, Text} from 'react-native';
import {useRoute} from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const SelfieScreen = ({navigation}) => {
  // Retrieve the logAttendance function from navigation options
  const route = useRoute();
  const logAttendance = route.params?.logAttendance;

  // Retrieve the assets and logAttendance function from the navigation parameters
  const {assets} = route.params;
  console.log('====================================');
  console.log(assets);
  console.log('====================================');

  console.log('====================================');
  console.log(logAttendance);
  console.log('====================================');
  return (
    <>
      <View
        style={{
          padding: 13,
          backgroundColor: '#1768AC',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 60,
        }}>
        <MaterialIcon
          name="chevron-left"
          size={37}
          color="#fff"
          fontWeight="700"
          onPress={() => navigation.replace('calendar')} // Navigate to "Home" (Tab Navigator), then "Dashboard"
        />

        <Text
          style={{
            color: '#fff',
            fontWeight: '600',
            textAlign: 'center',
            fontSize: 25,
            letterSpacing: 2.5,
          }}>
          Submit selfie
        </Text>
      </View>
      <View>
        {assets && // Showing the image here in the UI
          assets.map(({uri}) => (
            <View key={uri} style={styles.imageContainer}>
              <Image resizeMode="cover" style={styles.image} source={{uri}} />

              <View
                style={{
                  flexDirection: 'row',
                  gap: 20,
                  alignItems: 'center',
                  marginTop: 25,
                }}>
                <Button
                  title="Log Attendance"
                  onPress={() => logAttendance('IN')}
                />
                <Button
                  title="Go Back"
                  onPress={() => navigation.replace('calendar')}
                />
              </View>
            </View>
          ))}
      </View>
    </>
  );
};

const styles = {
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 400,
  },
};

export default SelfieScreen;
