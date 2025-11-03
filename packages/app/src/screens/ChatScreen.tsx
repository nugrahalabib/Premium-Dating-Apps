import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../state/AuthContext';
import { RootStackParamList } from '../navigation/RootNavigator';

// Tipe untuk route prop
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

// Tipe data dummy untuk pesan
interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string; // ID pengguna yang mengirim
    name: string;
  };
}

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { matchId } = route.params;
  const { user, token } = useAuth(); // Asumsi 'user' di AuthContext punya properti 'id'

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  // Fungsi untuk mengambil pesan dari API
  const fetchMessages = async () => {
    // Nanti, panggil GET /api/v1/matches/:matchId/messages
    const dummyMessages: Message[] = [
      { _id: 'msg1', text: 'Sounds great!', createdAt: new Date(), user: { _id: 'user4', name: 'Sarah' } },
      { _id: 'msg2', text: 'Yeah, I am free this weekend!', createdAt: new Date(), user: { _id: user.id, name: 'You' } },
    ].reverse(); // Biasanya pesan terbaru di bawah
    setMessages(dummyMessages);
  };

  useEffect(() => {
    fetchMessages();
  }, [matchId]);

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/matches/${matchId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: inputText }),
      });

      if (response.ok) {
        // Optimistic update atau fetch ulang
        fetchMessages();
        setInputText('');
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Could not send message.');
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.user._id === user.id ? styles.myMessage : styles.theirMessage
          ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        inverted // Tampilkan pesan dari bawah ke atas
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={handleSend} color="#6B4F4B" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#E0D8D1', backgroundColor: '#FDF0E0' },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 15, marginRight: 10, borderWidth: 1, borderColor: '#E0D8D1' },
  messageBubble: { padding: 10, borderRadius: 15, marginVertical: 5, marginHorizontal: 10, maxWidth: '80%' },
  myMessage: { backgroundColor: '#6B4F4B', alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: '#E0D8D1', alignSelf: 'flex-start' },
  messageText: { color: 'white' }
});

export default ChatScreen;
