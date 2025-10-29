import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProjectDetailsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Details Screen</Text>
      <Text>Project details will be displayed here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default ProjectDetailsScreen;