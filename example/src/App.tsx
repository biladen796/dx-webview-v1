import * as React from 'react';

import { Button, StyleSheet, View } from 'react-native';
import { CustomWebviewPortal } from 'webview-v1';

export default function App() {
  return (
    <View style={styles.container}>
      <Button title="Click" onPress={() => CustomWebviewPortal.show()}>
        Click to open webview
      </Button>
      <CustomWebviewPortal uri="https://dev.fusion-wall2.smaad.net/wall/156348913/?u=reacttest" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
