import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu, Search, MapPin, Calendar } from 'lucide-react-native';

const HomeTopNav = ({ searchTerm, setSearchTerm, onMenuPress, onSearchPress }) => {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress}>
        <Menu color="#fff" size={24} />
      </TouchableOpacity>
      
      <View style={styles.searchContainerWrapper}>
        <View style={styles.searchContainer}>
          
          <View style={styles.searchSectionItem}>
            <MapPin color="#000" size={14} />
            <View style={styles.searchSectionText}>
              <Text style={styles.searchLabel}>UBICACIÓN</Text>
              <Text style={styles.searchVal} numberOfLines={1}>Cualquiera</Text>
            </View>
          </View>
          
          <View style={styles.searchDivider} />
          
          <View style={styles.searchSectionItem}>
            <Calendar color="#000" size={14} />
            <View style={styles.searchSectionText}>
              <Text style={styles.searchLabel}>FECHAS</Text>
              <Text style={styles.searchVal} numberOfLines={1}>Cualquiera</Text>
            </View>
          </View>
          
          <View style={styles.searchDivider} />
          
          <View style={styles.searchSectionItemInput}>
            <Search color="#000" size={14} />
            <View style={styles.searchInputWrapper}>
              <Text style={styles.searchLabel}>BUSCAR</Text>
              <TextInput 
                style={styles.searchInput}
                placeholder="Artista, evento..."
                placeholderTextColor="#888"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={onSearchPress}
              />
            </View>
          </View>
          
          <TouchableOpacity style={styles.buscarBtn} onPress={onSearchPress}>
            <Text style={styles.buscarBtnText}>BUSCAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#000', // Solid background instead of absolute positioning so it doesn't overlap weirdly
    zIndex: 10,
  },
  menuBtn: {
    marginRight: 12,
  },
  searchContainerWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  searchSectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  searchSectionText: {
    marginLeft: 4,
  },
  searchLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  searchVal: {
    fontSize: 10,
    color: '#666',
    maxWidth: 40,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 2,
  },
  searchSectionItemInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  searchInputWrapper: {
    marginLeft: 4, 
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 10,
    color: '#000',
    padding: 0,
    height: 20,
  },
  buscarBtn: {
    backgroundColor: '#000',
    height: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginLeft: 4,
  },
  buscarBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
});

export default HomeTopNav;
