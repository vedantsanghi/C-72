import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config'
import firebase from 'firebase'

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedBookId: '',
      scannedStudentId: '',
      buttonState: 'normal'
    }
  }

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
        status === "granted" is false when user has not granted the permission
      */
      hasCameraPermissions: status === "granted",
      buttonState: id,
      scanned: false
    });
  }

  handleBarCodeScanned = async ({ type, data }) => {
    const { buttonState } = this.state

    if (buttonState === "BookId") {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
      });
    }
    else if (buttonState === "StudentId") {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal'
      });
    }

  }
  initiateBookIssue = async () => {
    db.collection("transactions").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      transactionType: "ISSUED",
      date: firebase.firestore.Timestamp.now().toDate(),
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: false,
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
      booksIssued: firebase.firestore.FieldValue.increment(1),
    })
    this.setState({
      scannedStudentId: '',
      scannedBookId: '',
    });
  };

  initiateBookReturn = async () => {
    db.collection("transactions").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      transactionType: "RETURNED",
      date: firebase.firestore.Timestamp.now().toDate(),
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: true,
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
      booksIssued: firebase.firestore.FieldValue.increment(-1),
    })
    this.setState({
      scannedStudentId: '',
      scannedBookId: '',
    });
  };
  handleTransaction = async () => {
    var transactionMessage = null;
    db.collection("books").doc(this.state.scannedBookId).get()
      .then((doc) => {
        var book = doc.data()
        if (book.bookAvailability) {
          this.initiateBookIssue();
          transactionMessage = "Book Issued"
          ToastAndroid.show(transactionMessage,ToastAndroid.LONG)
        }
        else {
          this.initiateBookReturn();
          transactionMessage = "Book Returned"
          alert(transactionMessage)
        }
        
      })

  }
  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if (buttonState !== "normal" && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }

    else if (buttonState === "normal") {
      return (
        <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
          <View >
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{ width: 200, height: 200 }} />
              <Text style={{ textAlign: 'center', fontSize: 30 }}>Wily</Text>
            </View>
            <View style={styles.inputView}>
              <TextInput
                style={styles.inputBox}
                placeholder="Book Id"
                onChangeText={(text) => {
                  this.setState({ scannedBookId: text });
                }}
                value={this.state.scannedBookId} />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => {
                  this.getCameraPermissions("BookId")
                }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
              <TextInput
                style={styles.inputBox}
                placeholder="Student Id"
                onChangeText={(text) => {
                  this.setState({ scannedStudentId: text });
                }}
                value={this.state.scannedStudentId} />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => {
                  this.getCameraPermissions("StudentId")
                }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={this.handleTransaction}>
              <Text style={styles.submitButtonText}>
                SUBMIT
            </Text>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>

      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10
  },
  inputView: {
    flexDirection: 'row',
    margin: 20
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20
  },
  scanButton: {
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0
  },
  submitButton: {
    backgroundColor: '#FBC02D',
    width: 120,
    height: 50
  },
  submitButtonText: {
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold",
    color: 'white'
  }
});