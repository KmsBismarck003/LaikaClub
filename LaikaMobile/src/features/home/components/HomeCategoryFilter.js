import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu, Music, Activity, MonitorPlay, Heart, Sparkles, Grid } from 'lucide-react-native';

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Grid },
  { id: 'concert', name: 'Conciertos', icon: Music },
  { id: 'sport', name: 'Deportes', icon: Activity },
  { id: 'theater', name: 'Teatro', icon: MonitorPlay },
  { id: 'family', name: 'Familiares', icon: Heart },
  { id: 'other', name: 'Otros', icon: Sparkles },
];

const HomeCategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.categoriesWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Icon color={isSelected ? '#fff' : '#666'} size={18} />
              <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesWrapper: {
    marginBottom: 24,
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryPillActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  categoryTextActive: {
    color: '#fff',
  },
});

export default HomeCategoryFilter;
