import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { colorPalette } from '../data/mockData';

export default function ColorPalette() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paleta de colores</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.paletteContainer}
      >
        {colorPalette.map((item, index) => (
          <View key={index} style={styles.colorItem}>
            <View 
              style={[
                styles.colorBox, 
                { backgroundColor: item.color },
                item.color === '#EDEDED' && styles.colorBoxBorder
              ]} 
            />
            <Text style={styles.colorCode}>{item.color}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    margin: Layout.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  paletteContainer: {
    gap: Layout.spacing.sm,
  },
  colorItem: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  colorBox: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.sm,
  },
  colorBoxBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorCode: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});