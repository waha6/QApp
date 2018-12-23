import { AppLoading, Font, Permissions } from "expo";
import React from "react";
import { Platform } from "react-native";
import ignoreWarnings from "react-native-ignore-warnings";
import { createAppContainer, createStackNavigator } from "react-navigation";
import Company from "./screens/Company";
import Demo from "./screens/Demo";
import User from "./screens/User";
import Home from "./screens/Home/Home";
import Login from "./screens/Login/Login";
import Roboto from "native-base/Fonts/Roboto.ttf";
import Roboto_medium from "native-base/Fonts/Roboto_medium.ttf";
import Ionicons from "native-base/Fonts/Ionicons.ttf";
ignoreWarnings("Setting a timer");

async function alertIfRemoteNotificationsDisabledAsync(p) {
  const { status } = await Permissions.getAsync(p);
  if (status !== "granted") console.log("NOT");
}

const AppNavigator = createAppContainer(
  createStackNavigator(
    {
      Login,
      Home,
      Company,
      Demo,
      User
    },
    {
      initialRouteName: "Login",
      headerMode: Platform.select({ ios: "float", android: "none" })
    }
  )
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }
  async componentWillMount() {
    await Font.loadAsync({
      Roboto,
      Roboto_medium,
      Ionicons
    });
    this.setState({ loading: false });
  }
  render() {
    if (this.state.loading) {
      return <AppLoading />;
    }
    return <AppNavigator />;
  }
}
export default App;
export { alertIfRemoteNotificationsDisabledAsync };
