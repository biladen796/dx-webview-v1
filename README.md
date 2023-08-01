# smaad-offerwall

Smaad webview

## Publish to npm

1. Login to npm
```sh
npm login
```
2. Pack your library
```sh
npm pack
```
3. Publish your library with the below command:
```sh
npm publish
```
## Installation

```sh
npm install react-native-webview webview-v2
```
or
```sh
yarn add react-native-webview webview-v2
```
## Usage
In your App.js (or App.tsx)
```js
import { CustomWebviewPortal } from 'smaad-offerwall';

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
