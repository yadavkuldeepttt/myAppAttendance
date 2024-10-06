import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  Pressable,
} from 'react-native'; // Added SafeAreaView, Image
import axios from 'axios'; // Import axios

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState(''); //email state handle
  const [username, setUsername] = useState(''); //username state handle
  const [password, setPassword] = useState(''); //password state
  const [confirmPassword, setConfirmPassword] = useState(''); //confirm password state
  const [isSignup, setIsSignup] = useState(false); // Toggle between Login/Signup

  // handle submit login and signup
  const handleSubmit = async () => {
    if (
      email === '' ||
      password === '' ||
      (isSignup && confirmPassword === '' && username === '')
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignup && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const url = `http://192.168.1.5:5000/api/auth/${
        isSignup ? 'signup' : 'login'
      }`;

      // Using axios to make the API request
      const response = await axios.post(url, {
        email,
        password,
        ...(isSignup && {username}),
        ...(isSignup && {confirmPassword}),
      });

      if (response.status === 201 || response.status === 200) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('userToken', response.data.token);

        // Verify the token by calling a protected route
        const tokenVerificationResponse = await axios.get(
          'http://192.168.1.5:5000/protected-route',
          {
            headers: {
              Authorization: `Bearer ${response.data.token}`, // Include the JWT in the Authorization header
            },
          },
        );

        if (tokenVerificationResponse.status === 200) {
          console.log('Token is valid:', tokenVerificationResponse.data);
          Alert.alert(
            'Success',
            isSignup ? 'Signup successful!' : 'Login successful!',
          );

          // Clear fields after signup success
          if (isSignup) {
            setEmail(''); // Clear email field
            setPassword(''); // Clear password field
            setUsername('');
            setConfirmPassword(''); // Clear confirmPassword
            setIsSignup(false); // Switch to login screen after signup
          } else {
            // If login is successful, navigate to HomeScreen
            navigation.replace('Home');
          }
        }
      }
    } catch (error) {
      // Check if the error is from the server response or network
      if (error.response) {
        Alert.alert(
          'Error',
          error.response.data.message || 'Something went wrong',
        );
      } else {
        Alert.alert('Error', 'Unable to connect to the server');
      }
      console.error('API Error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri: 'https://seeklogo.com/images/M/m-design-logo-09A5D82F03-seeklogo.com.png',
        }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>{isSignup ? 'Sign Up' : 'Login'}</Text>

      <View style={styles.inputView}>
        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        )}

        {/* <Button
          title={isSignup ? 'Sign Up' : 'Login'}
          onPress={handleSubmit}
        /> */}

        <View style={styles.buttonView}>
          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {!isSignup ? 'LOGIN' : 'Sign Up'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.switchContainer}>
        <Text>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
        </Text>
        <Button
          style={styles.signUp}
          title={isSignup ? 'Login' : 'Sign Up'}
          onPress={() => setIsSignup(prevState => !prevState)}
        />
      </View>

      {!isSignup && (
        <View style={{marginTop: 30, width: '70%'}}>
          <Pressable
            onPress={() => navigation.replace('AdminLogin')}
            style={{
              backgroundColor: '#f4f5f7',
              height: 45,
              borderColor: 'lightgray',
              borderWidth: 1,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              Login as Admin
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  image: {
    height: 130,
    width: 150,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: 20,
    color: 'red',
  },
  inputView: {
    gap: 15,
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 7,
  },
  switchContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: 'red',
    height: 45,
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonView: {
    width: '100%',
    paddingHorizontal: 50,
  },
  signUp: {
    paddingHorizontal: 15,
    borderRadius: 15,
  },
});

export default LoginScreen;
