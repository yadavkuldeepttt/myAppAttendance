<LinearGradient colors={["#7F7FD5", "#E9E4F0"]} style={{ flex: 1 }}>

</LinearGradient>
// {/* <View style={styles.container}>
{/* Top Left and Right Icons */}
<View style={styles.header}>
 <TouchableOpacity style={styles.iconButton}>
   {/* <FontAwesomeIcon icon={faBars} size={24} color="#fff" /> */}
   <Icon name="bars" size={25} color="#4CAF50" onPress={toggleSidebar} />

 </TouchableOpacity>

 <TouchableOpacity style={styles.iconButtonRight}>
   {/* <FontAwesomeIcon icon={faBell} size={24} color="#fff" /> */}
   <Icon name="user" size={25} color="#4CAF50" />

 </TouchableOpacity>
</View>

{/* Welcome Messages */}
<Text style={styles.greeting}>Good Morning</Text>
<Text style={styles.userName}>Hi, {userName}!</Text>

{/* Time and Date */}
<Text style={styles.clock}>{time}</Text>
<Text style={styles.date}>{date}</Text>

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
   <Icon name="close" size={25} color="#4CAF50" />
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
// </View> */}
// );
);
};



















// const [attendanceLogs, setAttendanceLogs] = useState({});
//   const [selectedDate, setSelectedDate] = useState(null); // For tracking the clicked date
//   const [modalVisible, setModalVisible] = useState(false);
//   const [status, setStatus] = useState(''); // Selected attendance status

//   const fetchAttendance = async (year, month) => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const response = await axios.get('http://192.168.1.5:5000/api/attendance/getAttendance', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         params: { month, year },
//       });

//       const logs = response.data;

//       console.log(logs,"logs feteched");
      

//       // Format the attendance data to match the calendar format
//       const formattedLogs = logs.reduce((acc, log) => {
//         const date = new Date(log.date).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
//         acc[date] = {
//           marked: true,
//           dotColor: log.status === 'IN' ? 'green' : log.status === 'OUT' ? 'red' : 'orange',
//           status: log.status,
//         };
//         return acc;
//       }, {});



//       setAttendanceLogs(formattedLogs);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch attendance logs');
//     }
//   };


  // Request location permission
// 
  
  // Submit attendance status

//   const logAttendance = async () => {
//     console.log(status, "status");
  
//     if (!status) {
//       Alert.alert('Error', 'Please select an attendance status');
//       return;
//     }
  
//     if (status === 'IN') {
//       // Request camera permission
//       const hasCameraPermission = await requestCameraPermission();
      
//       if (!hasCameraPermission) {
//         Alert.alert('Error', 'Camera permission denied');
//         return;
//       }
  
//       // Define camera options
//       const cameraOptions = {
//         saveToPhotos: true,
//         mediaType: 'photo',
//         includeBase64: false,
//         quality: 1,
//       };
  
//       console.log(cameraOptions, "camera options");
  
//       // Launch the camera
//       console.log("Opening camera...");
//       ImagePicker.launchCamera(cameraOptions, async (response) => {
//         console.log('Camera Response:', response); // Log the entire response
        
//         if (response.didCancel) {
//           console.log('User cancelled image picker');
//           return;
//         }
//         if (response.errorCode) {
//           console.log('Error Code:', response.errorCode);
//           Alert.alert('Error', response.errorMessage);
//           return;
//         }
//         if (response.assets && response.assets.length > 0) {
//           const { uri } = response.assets[0]; // URI of the captured image
//           console.log(uri, "Captured Image URI");
  
//           // Request location permission
//           const hasLocationPermission = await requestLocationPermission();
//           console.log(hasLocationPermission, "has location permission");
  
//           if (!hasLocationPermission) {
//             Alert.alert('Error', 'Location permission denied');
//             return;
//           }
  
//           // Get the current location
//           Geolocation.getCurrentPosition(
//             async (position) => {
//               const { latitude, longitude } = position.coords;
//               console.log(latitude, "latitude", longitude, "longitude");
  
//               try {
//                 const token = await AsyncStorage.getItem('userToken');
//                 const formData = new FormData();
//                 formData.append('status', status);
//                 formData.append('selfie', {
//                   uri,
//                   name: 'selfie.jpg',
//                   type: 'image/jpeg',
//                 });
//                 formData.append('latitude', latitude);
//                 formData.append('longitude', longitude);
  
//                 console.log('Form Data:', {
//                   status,
//                   selfieUri: uri,
//                   latitude,
//                   longitude,
//                 });
  
//                 const responseData = await axios.post('http://192.168.1.5:5000/api/attendance/log', formData, {
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'multipart/form-data',
//                   },
//                 });
  
//                 console.log('Server Response:', responseData.data);
  
//                 // Update attendance logs
//                 setAttendanceLogs({
//                   ...attendanceLogs,
//                   [selectedDate]: {
//                     marked: true,
//                     dotColor: 'green',
//                     status,
//                   },
//                 });
  
//                 setModalVisible(false);
//                 Alert.alert('Success', `Attendance ${status} logged successfully with selfie and location`);
//               } catch (error) {
//                 console.error('Error logging attendance:', error.response ? error.response.data : error.message);
//                 Alert.alert('Error', 'Failed to log attendance');
//               }
//             },
//             (error) => {
//               Alert.alert('Error', 'Failed to retrieve location');
//             },
//             { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//           );
//         } else {
//           console.error('No assets returned from camera');
//         }
//       });
//     } else {
//       // Handle "OUT", "Absent", "Leave" status
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         await axios.post('http://192.168.1.5:5000/api/attendance/log', { status }, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
  
//         setAttendanceLogs({
//           ...attendanceLogs,
//           [selectedDate]: {
//             marked: true,
//             dotColor: status === 'OUT' ? 'red' : 'orange',
//             status,
//           },
//         });
  
//         setModalVisible(false);
//         Alert.alert('Success', `Attendance ${status} logged successfully`);
//       } catch (error) {
//         Alert.alert('Error', 'Failed to log attendance');
//       }
//     }
//   };
  
  

  // Fetch attendance logs for the current month
//   useEffect(() => {
//     const today = new Date();
//     fetchAttendance(today.getFullYear(), today.getMonth() + 1); // Current month
//   }, []);












