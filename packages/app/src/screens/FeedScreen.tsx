import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, Alert, Image } from 'react-native';
import { useAuth } from '../state/AuthContext';

// Tipe data dummy untuk kartu profil
interface ProfileCard {
  id: string;
  userId: string;
  mediaUrl: string;
  promptText: string;
  user: {
    firstName: string;
    job: string; // Asumsi 'job' ada di data pengguna
  };
}

const FeedScreen = () => {
  const { token } = useAuth();
  const [cards, setCards] = useState<ProfileCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [icebreakerText, setIcebreakerText] = useState('');

  // Fungsi untuk mengambil kartu dari API
  const fetchCards = async () => {
    try {
        // Ganti dengan endpoint yang benar: GET /api/v1/feed atau sejenisnya
        // Untuk sekarang, kita gunakan data dummy
      const dummyCards: ProfileCard[] = [
        { id: 'card1', userId: 'user2', mediaUrl: 'https://via.placeholder.com/300', promptText: 'My ideal weekend involves good coffee and a long hike.', user: { firstName: 'Jane', job: 'Graphic Designer' } },
        { id: 'card2', userId: 'user3', mediaUrl: 'https://via.placeholder.com/300', promptText: 'The most spontaneous thing I’ve ever done is...', user: { firstName: 'Alex', job: 'Software Engineer' } },
      ];
      setCards(dummyCards);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      Alert.alert('Error', 'Could not load feed.');
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSendIcebreaker = async () => {
    if (icebreakerText.length < 50) {
      Alert.alert('Too Short', 'Your icebreaker message must be at least 50 characters long.');
      return;
    }

    const cardId = cards[currentIndex].id;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/cards/${cardId}/icebreaker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: icebreakerText }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Icebreaker sent!');
        goToNextCard();
      } else {
        const data = await response.json();
        Alert.alert('Failed', data.message || 'Could not send icebreaker.');
      }
    } catch (error) {
        console.error('Send icebreaker error:', error);
        Alert.alert('Error', 'Could not connect to the server.');
    } finally {
        setModalVisible(false);
        setIcebreakerText('');
    }
  };

  const goToNextCard = () => {
    setCurrentIndex(prev => prev + 1);
  };

  if (!cards[currentIndex]) {
    return <View style={styles.container}><Text style={styles.infoText}>No more profiles to show.</Text></View>;
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={styles.container}>
      {/* Modal untuk mengirim Icebreaker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Send an Icebreaker</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Break the ice... (min. 50 characters)"
              value={icebreakerText}
              onChangeText={setIcebreakerText}
              multiline
              maxLength={280}
            />
            <Button title="Send" onPress={handleSendIcebreaker} color="#6B4F4B" />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#B0A191" />
          </View>
        </View>
      </Modal>

      {/* Tampilan Kartu Profil */}
      <View style={styles.card}>
        <Image source={{ uri: currentCard.mediaUrl }} style={styles.cardImage} />
        <View style={styles.cardContent}>
            <Text style={styles.promptText}>{currentCard.promptText}</Text>
            <Text style={styles.userInfo}>{currentCard.user.firstName}, {currentCard.user.job}</Text>
        </View>
      </View>

      {/* Tombol Aksi */}
      <View style={styles.actions}>
        <Button title="Tolak" onPress={goToNextCard} color="#B0A191" />
        <Button title="Kirim Icebreaker" onPress={() => setModalVisible(true)} color="#6B4F4B" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF0E0', padding: 10 },
    card: { width: '100%', flex: 1, borderRadius: 15, backgroundColor: 'white', overflow: 'hidden', marginVertical: 20 },
    cardImage: { width: '100%', height: '70%' },
    cardContent: { padding: 15 },
    promptText: { fontSize: 18, color: '#333', fontStyle: 'italic' },
    userInfo: { fontSize: 22, fontWeight: 'bold', color: '#6B4F4B', marginTop: 10 },
    actions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingBottom: 20 },
    infoText: { fontSize: 18, color: '#6B4F4B' },
    // Modal Styles
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    modalInput: { width: '100%', minHeight: 100, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20, textAlignVertical: 'top' },
});

export default FeedScreen;
