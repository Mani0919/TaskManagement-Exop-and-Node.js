import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const AppHeader = ({ user, searchQuery, setSearchQuery, isSearchActive, setIsSearchActive, setLogoutDialogVisible }) => {
  // Simple profile display with first letter
  const firstLetter = user?.charAt(0)?.toUpperCase() || "U";
  
  // Get background color based on first letter
  const getAvatarColor = (letter) => {
    const colors = [
      "#6200EE", "#3700B3", "#03DAC6", "#018786", "#BB86FC", 
      "#6200E8", "#3F51B5", "#2196F3", "#009688", "#4CAF50"
    ];
    const index = letter?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };
  
  const backgroundColor = getAvatarColor(firstLetter);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {!isSearchActive ? (
        // Normal header
        <View style={styles.headerContent}>
          {/* Avatar and name */}
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { backgroundColor }]}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.nameText}>{user}</Text>
            </View>
          </View>
          
          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setIsSearchActive(true)}
            >
              <Ionicons name="search-outline" size={24} color="#6C757D" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setLogoutDialogVisible(true)}
            >
              <Ionicons name="log-out-outline" size={24} color="#6C757D" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Search header
        <View style={styles.searchBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setIsSearchActive(false);
              setSearchQuery('');
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#6C757D" />
          </TouchableOpacity>
          
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color="#6C757D" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 13,
    color: '#6C757D',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
});

export default AppHeader;