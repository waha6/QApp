import { ImagePicker, MapView, Permissions } from "expo";
import { Button, Container, Form, Input, Item, Label, Text } from "native-base";
import React from "react";
import {
  DatePickerAndroid,
  DatePickerIOS,
  Image,
  Modal,
  Platform,
  ScrollView,
  TimePickerAndroid,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import Autocomplete from "react-native-autocomplete-input";
import { alertIfRemoteNotificationsDisabledAsync } from "../../App";
import firebase, { app, db, sRef } from "../../Config/firebase";

const DEFAULT_TIME = "00:00 am";
const CLIENT_ID = "AWRV5JF2BBN20NLT5JUM22V45FP1Y4Z4KVPRPDN3QXBMHQZB";
const CLIENT_SECRET = "FMLGDQSWSCPOF3TAOYZQPXFQ2BPJGEP0WHBBABFND33Y4OGD";
const SUGGESTION_TIME = 3000;
const APILINK = `https://api.foursquare.com/v2/venues/explore?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=20180323&limit=3&ll=40.7243,-74.0018&query=`;

const MODAL_OPTIONS = {
  animationType: "slide",
  transparent: false
};
const DEFAULT_STATE = {
  visible: false,
  visibleMap: false,
  date: new Date(),
  companyName: "",
  timing: {
    openTime: DEFAULT_TIME,
    closeTime: DEFAULT_TIME
  },
  query: "",
  data: [],
  item: null,
  images: [],
  values: null
};

export default class Home extends React.Component {
  static navigationOptions = {
    title: "Welcome"
  };
  state = DEFAULT_STATE;

  componentWillMount() {
    db.ref("users/" + app.auth().currentUser.uid)
      .once("value")
      .then(s => {
        let v = s.val();
        this.setState({ values: v });
      });
    Platform.OS == "ios" &&
      alertIfRemoteNotificationsDisabledAsync(Permissions.CAMERA_ROLL);
    this._filterData(this.state.query);
  }
  render() {
    const {
      visible,
      date,
      companyName,
      timing,
      images,
      query,
      data,
      item,
      values
    } = this.state;
    const { openTime, closeTime } = timing;
    const m20 = {
      style: {
        margin: 20
      }
    };

    return (
      <Container>
        {item && (
          <Modal
            {...MODAL_OPTIONS}
            visible={this.state.visibleMap}
            onRequestClose={this.onRequestCloseMap}
          >
            <MapView
              style={{
                flex: 1
              }}
              initialRegion={{
                latitude: item[0].venue.location.lat,
                longitude: item[0].venue.location.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}
            >
              <MapView.Marker
                coordinate={{
                  latitude: item[0].venue.location.lat,
                  longitude: item[0].venue.location.lng
                }}
                title={item[0].venue.name}
              />
            </MapView>
          </Modal>
        )}
        {visible && (
          <Modal
            {...MODAL_OPTIONS}
            visible={visible}
            onRequestClose={this.onRequestClose}
          >
            <ScrollView>
              <Form {...m20}>
                <Item
                  style={{
                    borderBottomWidth: 0
                  }}
                >
                  <Label>Location</Label>
                </Item>
                <Item
                  style={{
                    borderBottomWidth: 0
                  }}
                >
                  <Autocomplete
                    style={{
                      borderWidth: 5,
                      borderColor: "white",
                      margin: -2,
                      marginBottom: 1,
                      ...(Platform.OS == "ios" ? { minWidth: 320 } : {})
                    }}
                    data={data.map(i => i.venue.name)}
                    defaultValue={query}
                    onChangeText={text => {
                      this.setState({ query: text });
                      this._filterData(text);
                    }}
                    renderItem={item => (
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({
                            query: item,
                            data: [],
                            item: data.filter(i => i.venue.name == item)
                          })
                        }
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </Item>
                {item && (
                  <Item
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      borderBottomWidth: 0
                    }}
                  >
                    <Button
                      block
                      transparent
                      dark
                      onPress={() => this.setState({ visibleMap: true })}
                    >
                      <Text>See in Map</Text>
                    </Button>
                  </Item>
                )}
                <Item floatingLabel {...m20}>
                  <Label>Name of Company</Label>
                  <Input
                    value={companyName}
                    onChangeText={companyName => this.setState({ companyName })}
                  />
                </Item>
                {Platform.select({
                  ios: (
                    <>
                      <Item
                        {...m20}
                        style={{
                          borderBottomWidth: 0
                        }}
                      >
                        <Label>Since</Label>
                      </Item>
                      <DatePickerIOS
                        mode="date"
                        date={date}
                        onDateChange={date => this.setState({ date })}
                      />
                    </>
                  ),
                  android: (
                    <Item
                      {...m20}
                      style={{
                        borderBottomWidth: 0
                      }}
                      onPress={async () => {
                        try {
                          const dp = DatePickerAndroid;
                          const { action, year, month, day } = await dp.open({
                            date: new Date()
                          });
                          if (action !== dp.dismissedAction) {
                            this.setState({
                              date: new Date(month + 1 + "/" + day + "/" + year)
                            });
                          }
                        } catch ({ code, message }) {
                          console.warn("Cannot open date picker", message);
                        }
                      }}
                    >
                      <Label>Since</Label>
                      <Text {...m20}>{date.toDateString()}</Text>
                    </Item>
                  )
                })}
                <Item
                  stackedLabel
                  style={{
                    borderBottomWidth: 0
                  }}
                >
                  <Label>Certificate</Label>
                </Item>
                <View
                  style={{
                    flex: 1,
                    flexWrap: "nowrap",
                    flexDirection: "row",
                    justifyContent: "center",
                    borderBottomWidth: 0
                  }}
                >
                  {images.length != 0 &&
                    images.map((i, n) => (
                      <TouchableOpacity onPress={() => this._pickImage(n)}>
                        <Image
                          ref={i => (this["i" + n] = i)}
                          source={{
                            uri: i
                          }}
                          style={{
                            flexGrow: 1,
                            width: images.length == 1 ? 200 : 125,
                            height: images.length == 1 ? 200 : 125
                          }}
                        />
                      </TouchableOpacity>
                    ))}
                  {images.length < 3 && (
                    <Item
                      style={{
                        flex: 1,
                        flexDirection: "column",
                        justifyContent: "center",
                        borderBottomWidth: 0
                      }}
                    >
                      <Button
                        block
                        transparent
                        dark
                        bordered
                        large
                        onPress={this._pickImage}
                      >
                        <Text>+</Text>
                      </Button>
                    </Item>
                  )}
                </View>
                {Platform.select({
                  ios: (
                    <>
                      <Item
                        stackedLabel
                        style={{
                          borderBottomWidth: 0
                        }}
                      >
                        <Text {...m20}>Timing</Text>
                      </Item>
                      <DatePickerIOS
                        mode="time"
                        date={
                          new Date(new Date().toDateString() + " " + openTime)
                        }
                        onDateChange={date =>
                          this._setTimeIOS({ date, openTime })
                        }
                      />
                      <Item stackedLabel>
                        <Text {...m20}>To</Text>
                      </Item>
                      <DatePickerIOS
                        mode="time"
                        date={
                          new Date(new Date().toDateString() + " " + closeTime)
                        }
                        onDateChange={date =>
                          this._setTimeIOS({ date, closeTime })
                        }
                      />
                    </>
                  ),
                  android: (
                    <Item
                      inlineLabel
                      style={{
                        borderBottomWidth: 0
                      }}
                    >
                      <Label>Timing</Label>
                      <TouchableHighlight
                        {...m20}
                        onPress={() => this._setTime({ openTime })}
                      >
                        <Text>{openTime}</Text>
                      </TouchableHighlight>
                      <Label>to</Label>
                      <TouchableHighlight
                        {...m20}
                        onPress={() => this._setTime({ closeTime })}
                      >
                        <Text>{closeTime}</Text>
                      </TouchableHighlight>
                    </Item>
                  )
                })}
                <Item
                  style={{
                    borderBottomWidth: 0,
                    justifyContent: "space-around"
                  }}
                >
                  <Button
                    large
                    block
                    rounded
                    transparent
                    bordered
                    danger
                    onPress={() => this.setState({ visible: false })}
                  >
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    large
                    block
                    rounded
                    transparent
                    bordered
                    success
                    onPress={this._submit}
                  >
                    <Text>Submit</Text>
                  </Button>
                </Item>
              </Form>
            </ScrollView>
          </Modal>
        )}
        {values && (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Button
                onPress={() => this.setState({ visible: true })}
                rounded
                dark
                large
                block
              >
                <Text> + </Text>
              </Button>
            </View>
          </View>
        )}
      </Container>
    );
  }

  onRequestClose = () => this.setState({ visible: false });
  onRequestCloseMap = () => this.setState({ visibleMap: false });
  _filterData = async q => {
    if (q == "") this.setState({ item: null, data: [] });
    else {
      const data = await fetch(APILINK + q)
        .then(j => j)
        .then(j => j.json());
      const t = data.response.groups[0].items;
      this.setState({ data: t });
      setTimeout(() => {
        if (this.state.data == t) this.setState({ data: [] });
      }, SUGGESTION_TIME);
    }
  };
  _setTime = async o => {
    try {
      const OBJ = Object.keys(o).includes("closeTime")
        ? "closeTime"
        : "openTime";
      const O = {};
      const tp = TimePickerAndroid;
      const { action, hour, minute } = await tp.open({
        hour: 0,
        minute: 0,
        is24Hour: false
      });
      if (action !== tp.dismissedAction) {
        let t = hour > 12 ? hour - 12 : hour == 0 ? 12 : hour;
        let m = hour > 11 ? "pm" : "am";
        O[OBJ] = t + ":" + (minute < 10 ? "0" : "") + minute + " " + m;
        this.setState({
          timing: {
            ...this.state.timing,
            ...O
          }
        });
      }
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
  };

  _setTimeIOS = o => {
    let OBJ = Object.keys(o)[0];
    let hour = o.date.getHours();
    let t = hour > 12 ? hour - 12 : hour == 0 ? 12 : hour;
    let m = hour > 11 ? "pm" : "am";
    let minute = o.date.getMinutes();
    let O;
    O[OBJ] = t + ":" + (minute < 10 ? "0" : "") + minute + " " + m;
    this.setState({
      timing: {
        ...this.timing,
        ...O
      }
    });
  };

  _pickImage = async (index = -1) => {
    let result = await ImagePicker.launchImageLibraryAsync();
    console.log(result);
    if (!result.cancelled) {
      var images = this.state.images;
      if (images.includes(result.uri)) return;
      if (typeof index !== "object") images[index] = result.uri;
      else images = [...images, result.uri];
      this.setState({ images });
      console.log("***********************", result);
      await fetch(result.uri);
    }
  };

  _submit = async () => {
    const { date, companyName, timing, images, item } = this.state;
    const { openTime, closeTime } = timing;
    const name = images[0].substring(images[0].lastIndexOf("/") + 1);
    console.log("ssssss", this.i0);
    if (!(companyName && images.length && item))
      return alert("Please put correctly!");
    const DETAIL = {
      companyName,
      timing,
      date,
      images,
      location: item
    };
    console.log(DETAIL);
  };
}
