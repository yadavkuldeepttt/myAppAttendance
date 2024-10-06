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
  TouchableOpacity,
} from 'react-native'; // Added SafeAreaView, Image
import axios from 'axios'; // Import axios
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing from FontAwesome

const AdminLogin = ({navigation}) => {
  const [email, setEmail] = useState(''); //email state handle
  const [password, setPassword] = useState(''); //password state

  // handle submit login and signup
  const handleSubmit = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const url = `http://192.168.1.5:5000/api/admin/${'login'}`;

      // Using axios to make the API request
      const response = await axios.post(url, {
        email,
        password,
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
          Alert.alert('Success', 'Login successful!');

          // If login is successful, navigate to HomeScreen
          navigation.replace('Home');
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
    <>
      <TouchableOpacity
        style={{
          flexDirection: 'row', // Arrange icon and text horizontally
          alignItems: 'center',
          padding: 20,
        }}
        onPress={() => navigation.replace('Login')}>
        <Icon name="arrow-left" size={20} />
        <Text style={{marginLeft: 10, fontSize: 18, color: '#000'}}>Back</Text>
      </TouchableOpacity>
      <SafeAreaView style={styles.container}>
        <Image
          source={{
            uri: 'https://seeklogo.com/images/M/m-design-logo-09A5D82F03-seeklogo.com.png',
          }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputView}>
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
          {/* login view */}
          <View style={styles.buttonView}>
            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>LOGIN</Text>
            </Pressable>
          </View>
          {/* forgot password */}
          <View
            style={{
              marginTop: 27,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Pressable onPress={()=>navigation.replace('forgotPassword')}>
              <Text>Forgot Password?</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
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
    paddingHorizontal: 10,
    borderRadius: 10,
    cursor: 'pointer',
  },
});

export default AdminLogin;
