import { Container, Header, Text, View, Button } from "native-base";
import React, { Component } from "react";
import { app } from "../../Config/firebase";

export default class User extends Component {
  render() {
    return (
      <Container>
        <View>
          <Button
            onPress={() => {
              app.auth().signOut();
            }}
          >
            <Text>Hello World</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
