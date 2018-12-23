import { Container, Text, Button, View } from "native-base";
import React from "react";
import { app, db } from "../../Config/firebase";

export default class Home extends React.Component {
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
              flex: 0,
              flexDirection: "row",
              justifyContent: "center",
              marginVertical: 30
            }}
          >
            <Button
              style={{ padding: 10 }}
              onPress={() => this._setStatus("Company")}
              transparent
              rounded
              bordered
              large
              block
              dark
            >
              <Text>Are you a company?</Text>
            </Button>
          </View>
          <View
            style={{
              flex: 0,
              flexDirection: "row",
              justifyContent: "center",
              marginVertical: 30
            }}
          >
            <Button
              style={{ padding: 10 }}
              onPress={() => this._setStatus("User")}
              transparent
              rounded
              bordered
              large
              block
              dark
            >
              <Text>{"Are you waiting/\nfinding for token?"}</Text>
            </Button>
          </View>
        </View>
      </Container>
    );
  }
  _setStatus = status => {
    const { uid } = app.auth().currentUser;
    db.ref("users/" + uid).update({ status, firstTime: true });
    this.props.navigation.replace(status);
  };
}
