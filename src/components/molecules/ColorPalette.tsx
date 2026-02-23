import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { Layout } from '../../../lib/core/constants/Layout';
import { colorPalette } from '../../../lib/modules/robot/data/mockData';

export default function ColorPalette() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paleta de colores</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.palette}>
        {colorPalette.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={[styles.box, { backgroundColor: item.color },
              item.color === '#EDEDED' && styles.boxBorder]} />
            <Text style={styles.code}>{item.color}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.card, borderRadius: Layout.borderRadius.md, padding: Layout.spacing.md, margin: Layout.spacing.md },
  title: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: Layout.spacing.md },
  palette: { gap: Layout.spacing.sm },
  item: { alignItems: 'center', gap: Layout.spacing.xs },
  box: { width: 48, height: 48, borderRadius: Layout.borderRadius.sm },
  boxBorder: { borderWidth: 1, borderColor: Colors.border },
  code: { fontSize: 10, color: Colors.textSecondary },
});