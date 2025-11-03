import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../state/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

// Tipe data dummy
interface Icebreaker {
  id: string;
  message: string;
  sender: {
    firstName: string;
  };
}

interface Match {
    id: string;
    user: {
        id: string;
        firstName: string;
    };
    lastMessage: string;
}

type MatchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;


const MatchScreen = () => {
  const { token } = useAuth();
  const navigation = useNavigation<MatchScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'pending' | 'matches'>('pending');
  const [icebreakers, setIcebreakers] = useState<Icebreaker[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  // Fungsi untuk mengambil data (nantinya dari API)
  const fetchData = async () => {
    // Ambil data icebreaker dan match dari API
    const dummyIcebreakers: Icebreaker[] = [
        { id: 'ice1', message: 'That hike looks amazing! Where was that photo taken?', sender: { firstName: 'Chris' } },
    ];
    const dummyMatches: Match[] = [
        { id: 'match1', user: { id: 'user4', firstName: 'Sarah' }, lastMessage: 'Sounds great!' },
    ];
    setIcebreakers(dummyIcebreakers);
    setMatches(dummyMatches);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptIcebreaker = async (icebreakerId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/icebreakers/${icebreakerId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        Alert.alert('Match!', 'You have a new match.');
        fetchData(); // Refresh data
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Could not accept icebreaker.');
      }
    } catch (error) {
      console.error('Accept icebreaker error:', error);
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  const renderPendingList = () => (
    <FlatList
      data={icebreakers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.itemText}><Text style={styles.bold}>{item.sender.firstName}</Text> sent you an icebreaker:</Text>
          <Text style={styles.messageText}>"{item.message}"</Text>
          <Button title="Accept" onPress={() => handleAcceptIcebreaker(item.id)} color="#6B4F4B" />
        </View>
      )}
    />
  );

  const renderMatchesList = () => (
      <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigation.navigate('Chat', { matchId: item.id })}>
                  <View style={styles.listItem}>
                      <Text style={styles.itemText}>Conversation with <Text style={styles.bold}>{item.user.firstName}</Text></Text>
                      <Text style={styles.messageText}>{item.lastMessage}</Text>
                  </View>
              </TouchableOpacity>
          )}
      />
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('pending')} style={[styles.tabButton, activeTab === 'pending' && styles.activeTab]}>
          <Text style={styles.tabText}>Pending Icebreakers ({icebreakers.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('matches')} style={[styles.tabButton, activeTab === 'matches' && styles.activeTab]}>
          <Text style={styles.tabText}>Active Matches ({matches.length})</Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'pending' ? renderPendingList() : renderMatchesList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FDF0E0' },
  tabButton: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#6B4F4B' },
  tabText: { color: '#6B4F4B', fontWeight: '600' },
  listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#E0D8D1' },
  itemText: { fontSize: 16, color: '#333' },
  bold: { fontWeight: 'bold' },
  messageText: { fontStyle: 'italic', color: '#555', marginVertical: 8 },
});

export default MatchScreen;
