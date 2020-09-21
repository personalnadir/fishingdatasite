import React from 'react';
import './App.css';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col, InputGroup, FormControl, Button, ListGroup} from 'react-bootstrap';
import convert from './dataconverter';
import transform from './datatransformer';
import FileSaver from 'file-saver';
import _ from 'underscore';
import axios from 'axios';
import questionnaireconvert from './questionnaireconverter';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideButton: true,
      participants: []
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.getUsers();
  }

  getUsers() {
    const url = process.env.REACT_APP_LOGIN_USERS;
    console.log(url);
    axios.get(url)
      .then(response => {
        if (response.status === 200) {
          this.setState({
            hideButton: this.state.hideButton,
            participants: response.data
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  handleInput(event){
    this.participantID = event.target.value;
    this.setState({
      hideButton: this.participantID === ""
    });
  }

  downloadDataSet(participant,identifier,set) {
    const url = `http://161.35.160.140/api/data/${participant}/set/${set}`;
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
          resolve({type:identifier, data:results.data});
        },
        downloadRequestHeaders: {
          'Authorization': `Basic ${btoa("admin:password")}`,
        }
      });
    });
  }

  collectParticipantData(participant){
    const dataSets = {
      trials: 'trials',
      vas: 'vas',
      keys: 'keys',
      gallery: 'gallery'
    };

    let downloads = [];
    for (const [key, value] of Object.entries(dataSets)) {
      downloads.push(this.downloadDataSet(participant,key,value));
    }

    const url = process.env.REACT_APP_LOGIN_URL;

    downloads.push(new Promise((resolve, reject) => {
      axios.get(url + `/${participant}`)
      .then(function (response) {
          if (response.status === 200) {
            if (response.data.ab) {
              resolve({type: 'ab', data:response.data.ab});
            } else {
              reject(response.data.error);
            }
          }
        })
        .catch(function (error) {
          reject(error);
        });
    }));


    Promise.allSettled(downloads).then(data =>{
      data = _.pluck(data, 'value');
      const trialData = _.findWhere(data, {type: 'trials'}).data;
      const keyData = _.findWhere(data, {type: 'keys'}).data;
      const vasData = _.findWhere(data, {type: 'vas'}).data;
      const galleryData = _.findWhere(data, {type: 'gallery'}).data;
      const abData = Array(trialData.length).fill({Participant_AB: _.findWhere(data, {type: 'ab'}).data});

      const newFormat = transform(
        convert(trialData).concat(
          abData,
          questionnaireconvert('keys', keyData),
          questionnaireconvert('vas', vasData),
          questionnaireconvert('gallery', galleryData),
          ),
      );
      const str = newFormat;
      const blob = new Blob([str], {type: "text/csv;charset=utf-8"});
      FileSaver.saveAs(blob, `FishingTask_${participant}.csv`);
    });
  }

  handleClick(event){
    this.collectParticipantData(this.participantID);
  }

  render() {
    const buttonGroup = this.state.hideButton ? null : (<InputGroup.Append>
      <Button variant="outline-secondary" onClick={this.handleClick}>Download Data</Button>
    </InputGroup.Append>);

    const participants = this.state.participants.map((val, idx) => (
        <ListGroup.Item key = {idx}>{val}<Button onClick={()=> this.collectParticipantData(val)} variant="primary" style={{float:'right'}}>Download</Button></ListGroup.Item>
    ));

    return (
      <Container fluid>
        <Row className="justify-content-md-center">
          <Col xs={6}>
            <InputGroup className="mb-3" onChange={this.handleInput}>
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">Participant ID</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
              placeholder="123456..."
              aria-label="Username"
              aria-describedby="basic-addon1"
              />
              {buttonGroup}
            </InputGroup>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col xs={6}>
            <ListGroup variant="flush">
              {participants}
            </ListGroup>
          </Col>
        </Row>

      </Container>
    );
  }
}

export default App;
