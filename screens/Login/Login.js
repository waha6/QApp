import { Facebook, Font } from "expo";
import { Button, Container, Icon, Text } from "native-base";
import React from "react";
import { View } from "react-native";
import firebase, { app, db } from "../../Config/firebase";
import Ionicons from "native-base/Fonts/Ionicons.ttf";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    !app.auth().currentUser && this.handleLogin();
  }

  async componentWillMount() {
    await Font.loadAsync({
      Ionicons
    });
  }

  componentDidMount() {
    app.auth().onAuthStateChanged(user => {
      if (user) {
        db.ref("users/" + user.uid)
          .once("value")
          .then(s => {
            let v = s.val();
            if (v) this.props.navigation.replace(v.status || "Home");
            else this.props.navigation.replace("Home");
          });
      }
    });
  }
  handleLogin = async () => {
    try {
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions
      } = await Facebook.logInWithReadPermissionsAsync("212952969612431", {
        permissions: ["public_profile", "email"]
      });
      if (type === "success") {
        const CREDENTIAL = firebase.auth.FacebookAuthProvider.credential(token);
        const data = await firebase
          .auth()
          .signInAndRetrieveDataWithCredential(CREDENTIAL)
          .catch(error => console.error(error));
        const { a, b } = data.user.metadata;
        if (a === b) {
          const { uid, displayName, email = "", photoURL } = data.user;
          db.ref("users/" + uid).set({
            name: displayName,
            email,
            photoURL
          });
        }
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  };

  render() {
    return (
      <Container>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center"
            }}
          >
            <Button onPress={this.handleLogin.bind(this)} rounded large block>
              <Icon name="logo-facebook" />
              <Text>facebook</Text>
            </Button>
          </View>
        </View>
      </Container>
    );
  }
}
