import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../state/AuthContext';

// Tipe data dummy untuk profil pengguna
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  // Tambahkan field lain sesuai kebutuhan
}

const ProfileScreen = () => {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/profile/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          Alert.alert('Error', 'Failed to fetch profile data.');
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
        Alert.alert('Error', 'Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return <ActivityIndicator size="large" color="#6B4F4B" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      {profile ? (
        <>
          <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
          <Text style={styles.detail}>{profile.email}</Text>
          <Text style={styles.detail}>Born: {new Date(profile.birthDate).toLocaleDateString()}</Text>

          <View style={styles.buttonContainer}>
            <Button title="Edit Profile" onPress={() => { /* Navigasi ke layar edit */ }} color="#6B4F4B" />
            <Button title="Manage Conversation Cards" onPress={() => { /* Navigasi ke layar kartu */ }} color="#6B4F4B" />
          </View>
        </>
      ) : (
        <Text style={styles.detail}>Could not load profile.</Text>
      )}

      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={logout} color="#B0A191" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDF0E0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF0E0',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4F4B',
    textAlign: 'center',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 30,
    gap: 10,
  },
  logoutButton: {
    marginTop: 'auto', // Mendorong tombol logout ke bawah
  },
});

export default ProfileScreen;
