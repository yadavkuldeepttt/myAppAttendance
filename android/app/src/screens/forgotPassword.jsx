import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing from FontAwesome
import {SafeAreaView} from 'react-native-safe-area-context';

const ForgotPassword = ({navigation}) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter mobile number, Step 2: Enter OTP

  const requestOtp = async () => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    try {
      const response = await axios.post(
        'http://192.168.1.5:5000/admin/request-otp',
        {
          mobileNumber,
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'OTP sent to your mobile number');
        setStep(2); // Move to OTP input step
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send OTP',
      );
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    try {
      const response = await axios.post(
        'http://192.168.1.5:5000/admin/verify-otp',
        {
          mobileNumber,
          otp,
        },
      );

      if (response.status === 200) {
        navigation.navigate('ResetPassword', {mobileNumber});
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to verify OTP',
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: 'row', // Arrange icon and text horizontally
          alignItems: 'center',
          padding: 20,
        }}
        onPress={() => navigation.replace('AdminLogin')}>
        <Icon name="arrow-left" size={20} />
        <Text style={{marginLeft: 10, fontSize: 18, color: '#000'}}>Back</Text>
      </TouchableOpacity>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 10,
          width: '100%',
        }}>
        <Image
          source={{
            uri: 'https://seeklogo.com/images/M/m-design-logo-09A5D82F03-seeklogo.com.png',
          }}
          style={{height: 130, width: 150}}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 27,
            fontWeight: 'bold',
            textAlign: 'center',
            paddingVertical: 20,
            color: 'red',
          }}>
          Forgot Password
        </Text>

        <View style={{marginTop: 30, width: '75%'}}>
          {step === 1 && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.inputMobile}
                  placeholder="Enter Mobile Number"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <Pressable style={styles.button} onPress={requestOtp}>
                <Text style={styles.buttonText}>Request OTP</Text>
              </Pressable>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>Enter OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />
              <Pressable style={styles.button} onPress={verifyOtp}>
                <Text style={styles.buttonText}>Verify OTP</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row', // To align +91 and input horizontally
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 7,
    paddingHorizontal: 10,
    height: 50,
  },
  prefix: {
    fontSize: 18,
    color: '#000',
    marginRight: 10, // Adds space between +91 and input field
  },
  inputMobile: {
    flex: 1, // Takes up remaining space after prefix
    fontSize: 18,
    paddingVertical: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '44%',
    marginLeft: 170,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ForgotPassword;
