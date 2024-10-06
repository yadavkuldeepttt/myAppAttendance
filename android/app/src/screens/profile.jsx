import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import image from '../assets/background.png';
import {jwtDecode} from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import {SafeAreaView} from 'react-native-safe-area-context';
import ChangePasswordModal from '../components/changePasswordModal';

const Profile = ({navigation}) => {
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [userDetails, setUserDetails] = useState({
    username: '',
    email: '',
    image: '',
    role: '',
    mobile: '',
    address: '',
  });
  const [missingFields, setMissingFields] = useState({});
  const [imageUri, setImageUri] = useState(null);
  const [token, setToken] = useState('');

  const chooseImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(uri);
        setUserDetails({
          ...userDetails,
          image:uri,
        });
      }
    });
  };

  const validateFields = () => {
    let isValid = true;
    const newMissingFields = {};

    // Check if username is provided
    if (!userDetails.username) {
      isValid = false;
      newMissingFields.username = 'Username is required.';
    }

    // Validate email using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userDetails.email && !emailRegex.test(userDetails.email)) {
      isValid = false;
      newMissingFields.email = 'Invalid email format.';
    }

    // Validate mobile using regex
    const mobileRegex = /^\d{10}$/;
    if (userDetails.mobile && !mobileRegex.test(userDetails.mobile)) {
      isValid = false;
      newMissingFields.mobile = 'Mobile must be a 10-digit number.';
    }

    setMissingFields(newMissingFields);
    return isValid;
  };

  const removePhoto = () => {
    setImageUri(null); // Remove the image
    setUserDetails({
      ...userDetails,
      image:null,
    });
    setShowOptions(false);
  };

  const setAvatar = () => {
    console.log('Set as Avatar');
    setImageUri(Image.resolveAssetSource(require('../assets/profile.png')).uri);
    setUserDetails({
      ...userDetails,
      image:null,
    });
    setShowOptions(false);
  };

  // Fetch user info from backend
  const fetchUserDetails = async userId => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `http://192.168.1.5:5000/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.status === 200) {
        const data = response.data;

        console.log('====================================');
        console.log(response.data);
        console.log('====================================');
        setUserDetails({
          username: data.username || '',
          email: data.email || '',
          image: data.image
            ? `http://192.168.1.5:5000/${data.image.replace(/\\/g, '/')}`
            : '',
          role: data.role || '',
          mobile: data.mobile || '',
          address: data.address || '',
        });

        // Convert backslashes to forward slashes for image path
        const imageUrl = data.image ? `http://192.168.1.5:5000/${data.image.replace(/\\/g, '/')}` : '';
console.log('====================================');
console.log(imageUrl);
console.log('====================================');
        setImageUri(imageUrl);

      console.log('====================================');
      console.log(imageUri,'image uri');
      console.log('====================================');

        // Check for empty fields and update the `missingFields` state
        const fieldsToFill = {};
        if (!data.username) fieldsToFill.username = 'Please add your full name';
        if (!data.email) fieldsToFill.email = 'Please add your email';
        if (!data.address) fieldsToFill.address = 'Please add your address';
        if (!data.mobile) fieldsToFill.mobile = 'Please add your mobile number';
        if (!data.role) fieldsToFill.role = 'Please add your role';

        setMissingFields(fieldsToFill);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Function to decode token and get user info
  const decodeToken = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        const decodedToken = jwtDecode(userToken);

        setToken(decodedToken);
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

  useEffect(() => {
    // Simulating data loading (remove this in real application)
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after data is loaded
    }, 1000); // Adjust the timeout duration based on actual loading time

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  const handleEdit = () => {
    setModalVisible(true); // Open the modal
  };

  // Function to handle saving the edited user details
  const handleSave = async () => {
    // Validate fields before proceeding
    const isValid = validateFields();
    console.log(isValid, 'is valid');

    if (!isValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return; // Exit if validation fails
    }

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return;

      const decodedToken = jwtDecode(userToken);
      const userId = decodedToken.id;

      console.log('====================================');
      console.log(userDetails.image,'user details image found');
      console.log('====================================');
      // Create a FormData instance
      const formData = new FormData();
      formData.append('username', userDetails.username);
      formData.append('email', userDetails.email);
      formData.append('role', userDetails.role);
      formData.append('mobile', userDetails.mobile);
      formData.append('address', userDetails.address);

      // Check if imageUri is available before adding it to the form data
      if (userDetails.image) {
        console.log('====================================');
        console.log(userDetails.image,'image uri found');
        console.log('====================================');
        // Adjust the filename and type if necessary
        formData.append('image', {
          uri: userDetails.image,
          name: 'profile.jpg', // Use the appropriate file name and extension
          type: 'image/jpeg', // Update the mime type as needed (e.g., image/png)
        });
      }
      console.log(formData, 'form data');

      const response = await axios.put(
        `http://192.168.1.5:5000/update-user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'multipart/form-data', // Specify the content type for FormData
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'User details updated successfully!');
        setModalVisible(false);
        fetchUserDetails(userId); // Refresh user details
      } else {
        Alert.alert('Error', 'Failed to update user details.');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      Alert.alert('Error', 'An error occurred while updating user details.');
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');
  };

  const handleOpenModal = () => {
    setPasswordModalVisible(true);
  };

  const handleCloseModal = () => {
    setPasswordModalVisible(false);
  };

  return (
    <>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1768AC" />
        </View>
      ) : (
        <View style={{height: '100%'}}>
          <ImageBackground
            source={image}
            resizeMode="cover"
            style={styles.header}>
            <View style={styles.headerContent}>
              <View style={{flex: 1, flexDirection: 'column', gap: 33}}>
                <View style={{flex: 1, marginTop: 20}}>
                  <Text style={styles.name}>Welcome</Text>
                  <Text style={styles.userInfo}>{userDetails.username}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleEdit}
                  style={{
                    height: 30,
                    padding: 5,
                    width: 30,
                    backgroundColor: '#fff',
                    borderRadius: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <MaterialIcon
                    name="edit"
                    size={20}
                    fontWeight="bold"
                    color="#1768AC"
                  />
                </TouchableOpacity>
              </View>
              <View>
                <Image
                  style={styles.avatar}
                  source={
                    userDetails.image
                      ? {uri: userDetails.image}
                      : require('../assets/NoProfile.jpg')
                  }
                />
              </View>
            </View>
          </ImageBackground>
          <ScrollView>
            {/* employee details */}
            <View style={{paddingHorizontal: 20, paddingTop: 20}}>
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                  paddingBottom: 15,
                  paddingTop: 5,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', flex: 1, fontSize: 17}}>
                  Full Name
                </Text>
                <Text style={{flex: 1, fontSize: 16}}>
                  {userDetails.username || 'N/A'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                  paddingBottom: 15,
                  paddingTop: 5,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', flex: 1, fontSize: 17}}>
                  Email
                </Text>
                <Text style={{flex: 1, fontSize: 16}}>
                  {userDetails.email || 'N/A'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                  paddingBottom: 15,
                  paddingTop: 5,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', flex: 1, fontSize: 17}}>
                  Address
                </Text>
                <Text style={{flex: 1, fontSize: 16}}>
                  {userDetails.address || 'N/A'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                  paddingBottom: 15,
                  paddingTop: 5,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', flex: 1, fontSize: 17}}>
                  Mobile
                </Text>
                <Text style={{flex: 1, fontSize: 16}}>
                  {userDetails.mobile || 'N/A'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  paddingBottom: 15,
                  paddingTop: 5,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', flex: 1, fontSize: 17}}>
                  Role
                </Text>
                <Text style={{flex: 1, fontSize: 16}}>
                  {userDetails.role || 'N/A'}
                </Text>
              </View>
            </View>
            {/* forgot password and log out */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: '#ccc',
                padding: 10,
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
              <Pressable onPress={handleOpenModal}>
                <Text
                  style={{color: '#007BFF', fontWeight: '500', padding: 10}}>
                  Change Password
                </Text>
              </Pressable>
              <Pressable onPress={handleLogout}>
                <Text
                  style={{color: '#FF4D4D', fontWeight: '500', padding: 10}}>
                  Log Out
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Edit Modal */}
          <Modal visible={modalVisible} animationType="slide">
            <LinearGradient colors={['#f9f9f9', '#E9E4F0']} style={{flex: 1}}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Edit Details</Text>
                <View
                  style={{
                    justifyContent: 'center',
                    width: '100%',
                    position: 'relative',
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                     
                        <Image
                        style={styles.avatar}
                        source={
                          userDetails.image || imageUri
                          ? {uri:  userDetails.image || imageUri}
                          : require('../assets/NoProfile.jpg')
                        }
                        />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowOptions(!showOptions)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 30,
                      backgroundColor: '#fff', // Change this color as needed
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <MaterialIcon
                      name="more-vert"
                      size={20}
                      color="#333"
                      style={{fontWeight: '400'}}
                    />
                  </TouchableOpacity>
                </View>

                {/* Options Card */}
                {showOptions && (
                  <View style={styles.optionsCard}>
                    <TouchableOpacity onPress={chooseImage}>
                      <Text style={styles.optionText}>Choose Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={removePhoto}>
                      <Text style={styles.optionText}>Remove Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={setAvatar}>
                      <Text style={styles.optionText}>Set as Avatar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {/* Editable fields with prompts for missing data */}
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={userDetails.username}
                  onChangeText={text =>
                    setUserDetails({...userDetails, fullName: text})
                  }
                />
                {missingFields.fullName && (
                  <Text style={styles.missingField}>
                    {missingFields.fullName}
                  </Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={userDetails.email}
                  onChangeText={text =>
                    setUserDetails({...userDetails, email: text})
                  }
                />
                {missingFields.email && (
                  <Text style={styles.missingField}>{missingFields.email}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={userDetails.address}
                  onChangeText={text =>
                    setUserDetails({...userDetails, address: text})
                  }
                />
                {missingFields.address && (
                  <Text style={styles.missingField}>
                    {missingFields.address}
                  </Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Mobile"
                  value={userDetails.mobile}
                  onChangeText={text =>
                    setUserDetails({...userDetails, mobile: text})
                  }
                />
                {missingFields.mobile && (
                  <Text style={styles.missingField}>
                    {missingFields.mobile}
                  </Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Role"
                  value={userDetails.role}
                  onChangeText={text =>
                    setUserDetails({...userDetails, role: text})
                  }
                />
                {missingFields.role && (
                  <Text style={styles.missingField}>{missingFields.role}</Text>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 20,
                    gap: 20,
                  }}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Modal>
          {/* Change Password Modal */}
          <ChangePasswordModal
            isVisible={isPasswordModalVisible}
            onClose={handleCloseModal}
            token={token}
          />
        </View>
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
    height: 200,
  },

  headerContent: {
    padding: 30,
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 63,
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 10,
    float: 'right',
  },

  name: {
    fontSize: 19,
    color: 'black',
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  headtText: {
    fontFamily: 'Helvetica',
    color: 'grey',
    fontWeight: '600',
    float: 'left',
    marginLeft: 20,
    marginTop: 10,
  },

  userInfo: {
    fontSize: 22,
    color: 'white',
    fontWeight: '600',
  },

  editButton: {
    height: 30,
    padding: 5,
    width: 30,
    backgroundColor: '#fff',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
    fontSize: 16,
  },
  missingField: {color: 'red', marginBottom: 15},
  saveButton: {
    backgroundColor: '#1768AC',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 18},
  cancelButton: {
    backgroundColor: '#ddd', // or any color you'd like for cancel
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  optionsCard: {
    position: 'absolute',
    top: 60, // Adjust as needed for positioning
    right: 0,
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    paddingVertical: 10,
  },
  optionText: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
});

export default Profile;
