import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../state/AuthContext';

// Definisikan tipe untuk properti navigasi
type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState(''); // Format: YYYY-MM-DD
  const { login } = useAuth();


  const handleRegister = async () => {
    // Validasi input sederhana
    if (!email || !password || !firstName || !lastName || !birthDate) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          birthDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Asumsi API mengembalikan token setelah registrasi berhasil
        Alert.alert('Success', 'Registration successful! You are now logged in.');
        login(data.token, data.user);
      } else {
        Alert.alert('Registration Failed', data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Birth Date (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate} />

      <Button title="Register" onPress={handleRegister} color="#6B4F4B" />
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate('Login')}
        color="#B0A191"
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#FDF0E0',
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6B4F4B',
        textAlign: 'center',
        marginBottom: 24,
      },
      input: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0D8D1',
      },
});

export default RegisterScreen;
