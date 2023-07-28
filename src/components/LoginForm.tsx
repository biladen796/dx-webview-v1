import React, { memo, useState } from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, View } from 'react-native';

const LoginForm = memo(
  ({
    onCancel,
    onSubmit,
  }: {
    onCancel: () => void;
    onSubmit: ({ name, pass }: { name: string; pass: string }) => void;
  }) => {
    const [name, setName] = useState('');
    const [pass, setPass] = useState('');
    return (
      <Modal
        visible={true}
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          onCancel();
        }}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.container,
            { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
          ]}
        >
          <View style={styles.loginContainer}>
            <View>
              <Text style={{ fontSize: 20, color: 'black' }}>
                Authentication Required
              </Text>
            </View>
            <View>
              <Text style={{ color: 'black' }}>
                Enter your login credentials
              </Text>
            </View>
            <View style={{ marginVertical: 8 }}>
              <TextInput
                placeholder="Username"
                value={name}
                style={styles.borderInput}
                onChangeText={(text) => {
                  setName(text);
                }}
              />
            </View>
            <View style={{ marginBottom: 12 }}>
              <TextInput
                placeholder="Password"
                secureTextEntry={true}
                value={pass}
                style={styles.borderInput}
                onChangeText={(text) => {
                  setPass(text);
                }}
              />
            </View>
            <View style={styles.buttonContainer}>
              <View>
                <Button title="CANCEL" onPress={onCancel} />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Button
                  title="  OK  "
                  onPress={() => onSubmit({ name, pass })}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

export default LoginForm;

const styles = StyleSheet.create({
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 2,
  },
  loginContainer: {
    backgroundColor: 'white',
    padding: 24,
    width: '80%',
    zIndex: 20,
    elevation: 2,
  },
  borderInput: {
    borderBottomColor: '#2196f3',
    borderBottomWidth: 1,
    padding: 4,
  },
});
