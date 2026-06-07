import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';

export default function PendingApprovalsScreen() {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const [pendingSlots, setPendingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [fetchedSlots, setFetchedSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  useEffect(() => {
    const q = query(collection(db, 'booking_requests'), where('status', '==', 'pending'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const slotsWithDetails = await Promise.all(snapshot.docs.map(async (slotDoc) => {
          const slotData = slotDoc.data();
          
          let patientName = 'Unknown Patient';
          let patientPhone = 'N/A';
          let doctorName = 'Unknown Doctor';

          if (slotData.patientId) {
            const pRef = doc(db, 'patients', slotData.patientId);
            const pSnap = await getDoc(pRef);
            if (pSnap.exists()) {
              patientName = pSnap.data().name || 'Unknown Patient';
              patientPhone = pSnap.data().phoneNumber || 'N/A';
            }
          }

          if (slotData.doctorId) {
            const dRef = doc(db, 'doctors', slotData.doctorId);
            const dSnap = await getDoc(dRef);
            if (dSnap.exists()) {
              doctorName = dSnap.data().name || 'Unknown Doctor';
            }
          }

          return {
            id: slotDoc.id,
            ...slotData,
            patientName,
            patientPhone,
            doctorName
          };
        }));
        
        // sort by timestamp descending (newest first)
        slotsWithDetails.sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });

        setPendingSlots(slotsWithDetails);
        setLoading(false);
      } catch (error) {
        console.error("Error populating pending slots:", error);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching pending slots:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAssignModal = async (item) => {
    setActiveRequest(item);
    setSelectedSlots([]);
    setFetchedSlots([]);
    setIsModalVisible(true);
    setFetchingSlots(true);
    
    try {
      const q = query(
        collection(db, 'available_slots'), 
        where('doctorId', '==', item.doctorId),
        where('isBooked', '==', false)
      );
      const snapshot = await getDocs(q);
      const slotsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort by date, then time
      slotsList.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      });
      
      setFetchedSlots(slotsList);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch slots.');
    } finally {
      setFetchingSlots(false);
    }
  };

  const toggleSlotSelection = (slot) => {
    if (selectedSlots.find(s => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const confirmBooking = async () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one slot to assign.');
      return;
    }
    
    setConfirmingId(activeRequest.id);
    setIsModalVisible(false);
    
    try {
      for (const slot of selectedSlots) {
        const slotRef = doc(db, 'available_slots', slot.id);
        await updateDoc(slotRef, {
          isBooked: true,
          patientId: activeRequest.patientId
        });
      }
      
      const assignedTimeStr = selectedSlots.map(s => `${s.date} ${s.time}`).join(', ');
      
      const reqRef = doc(db, 'booking_requests', activeRequest.id);
      await updateDoc(reqRef, {
        status: 'confirmed',
        assignedTime: assignedTimeStr,
        confirmedAt: new Date().toISOString()
      });
      
      Alert.alert('Success', 'Booking confirmed and slots assigned!');
    } catch (error) {
      console.error('Error confirming booking:', error);
      Alert.alert('Error', 'Failed to confirm booking.');
    } finally {
      setConfirmingId(null);
      setActiveRequest(null);
    }
  };

  const renderItem = ({ item }) => (
    <ClayCard style={styles.card}>
      <Text style={styles.cardTitle}>Dr. {item.doctorName}</Text>
      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Requested At:</Text>
        <Text style={styles.detailValue}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Patient:</Text>
        <Text style={styles.detailValue}>{item.patientName}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Phone:</Text>
        <Text style={styles.detailValue}>{item.patientPhone}</Text>
      </View>
      
      <ClayButton 
        title="Assign Time"
        onPress={() => openAssignModal(item)}
        loading={confirmingId === item.id}
        style={styles.confirmButton}
      />
    </ClayCard>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : pendingSlots.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No pending requests.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingSlots}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
          }
        />
      )}

      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Slots</Text>
            
            {fetchingSlots ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : fetchedSlots.length === 0 ? (
              <Text style={styles.emptySlotsText}>No slots published for this doctor.</Text>
            ) : (
              <ScrollView style={styles.slotsScroll} contentContainerStyle={styles.slotsGrid}>
                {fetchedSlots.map((slot) => {
                  const isSelected = selectedSlots.some(s => s.id === slot.id);
                  return (
                    <TouchableOpacity 
                      key={slot.id} 
                      style={[
                        styles.slotChip, 
                        isSelected && styles.slotChipSelected
                      ]}
                      onPress={() => toggleSlotSelection(slot)}
                    >
                      <Text style={[
                        styles.slotChipText,
                        isSelected && styles.slotChipTextSelected
                      ]}>
                        {slot.date}
                        {'\n'}
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <ClayButton 
              title={`Confirm ${selectedSlots.length > 0 ? `(${selectedSlots.length})` : ''}`} 
              onPress={confirmBooking} 
              style={styles.generateButton}
              disabled={selectedSlots.length === 0}
            />
            
            <ClayButton 
              title="Cancel" 
              onPress={() => setIsModalVisible(false)} 
              style={styles.cancelButton} 
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  card: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 20,
    marginBottom: theme.spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: isDarkMode ? '#CCCCCC' : theme.colors.textLight,
    width: 100,
  },
  detailValue: {
    ...theme.typography.body,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: isDarkMode ? '#333333' : '#EEEEEE',
    marginVertical: theme.spacing.md,
  },
  confirmButton: {
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: theme.spacing.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 22,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  emptySlotsText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
  generateButton: {
    marginBottom: theme.spacing.md,
  },
  slotsScroll: {
    flexGrow: 0,
    maxHeight: 300,
    marginBottom: theme.spacing.lg,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotChip: {
    width: '48%',
    backgroundColor: isDarkMode ? '#333333' : '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slotChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  slotChipText: {
    ...theme.typography.body,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  slotChipTextSelected: {
    color: '#1A1A1A',
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    fontSize: 16,
  }
});
