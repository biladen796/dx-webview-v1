# webview-v1

Smaad webview

## Installation

```sh
npm install react-native-webview webview-v1
```
or
```sh
yarn add react-native-webview webview-v1
```
## Usage
In your App.js (or App.tsx)
```js
import { CustomWebviewPortal } from 'webview-v1';

// ...

const App = () => {

  // ...

  return (
    <SafeAreaProvider>
      <SafeAreaView style={CommonStyles.container}>
        <NativeBaseProvider>
          <Provider store={store}>
            <StatusBar
              backgroundColor={'transparent'}
              barStyle={'dark-content'}
            />
            <Navigation />
            {/* Add Custom webview here */}
            <CustomWebviewPortal />
          </Provider>
        </NativeBaseProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default App
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
