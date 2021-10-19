import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.state = {
      isShowed: true,
      phoneNumber: '',
      accessCode: '',
      message: ''
    }
  }

  handleInput = e => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    const { phoneNumber, isShowed, accessCode } = this.state;
    if (isShowed) {
      this.setState({ isShowed: false })
      const data = {
        phoneNumber,
      };
      axios
        .post('http://localhost:3001/send', data)
        .then(() => console.log('Send successfully'))
        .catch(err => {
          console.error(err);
        });
    } else {
      const data = {
        phoneNumber,
        accessCode
      };
      axios
        .post('http://localhost:3001/verify', data)
        .then((res) => {
          const success = res.data.success;
          if(success){
            this.setState(() => ({ "message": "Login Successfully", accessCode: '' }));
          }else{
            this.setState(() => ({ "message": "Login Failed"}));
          }      
        })
        .catch(err => {
          console.error(err);
        });
    }
  };


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>{this.state.message}</h1>
          <form onSubmit={this.handleSubmit}>
            <label>Phone Number: </label>
            <input type="text"
              name="phoneNumber"
              value={this.state.phoneNumber}
              disabled={!this.state.isShowed}
              onChange={this.handleInput}
              maxLength="10"
            />
            <br />
            <label>Access Code: </label>
            <input type="text"
              name="accessCode"
              value={this.state.accessCode}
              disabled={this.state.isShowed}
              onChange={this.handleInput}
            />
            <br />
            <button type="submit">
              Send
              </button>
          </form>
        </div>
      </div>
    );
  }
}

export default App;