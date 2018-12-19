import React, { Fragment } from "react";
import { render, findDOMNode } from "react-dom";
import Colyseus from "colyseus.js";

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import red from '@material-ui/core/colors/red';
import Modal from '@material-ui/core/Modal';
import purple from '@material-ui/core/colors/purple';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

let counter;

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}
const style = {
  clock: {
    background: '#000',
    color: '#fff',
    width: '30%',
    margin: '0 auto',
    fontSize: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: purple[500],
    color: '#fff'
  },
  notify: {
    width: '50%',
    display: 'flex',
    background: '#fff',
    justifyContent: "center",
    alignItems: 'center',
  },
  modal: {
    display: 'flex',
    justifyContent: "center",
    alignItems: 'center'
  },
  info: {
    margin: "10px auto",
    width: '50%',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  point: {
    fontWeight: 'bold',
    color: red[500]
  }
}

class Main extends React.Component {
  constructor() {
    super();

    // use current hostname/port as colyseus server endpoint
    var endpoint =
      location.protocol.replace("http", "ws") + "//" + location.hostname;

    // development server
    if (location.port && location.port !== "80") {
      endpoint += ":2657";
    }

    this.colyseus = new Colyseus(endpoint);
    this.chatRoom = this.colyseus.join("chat", {
      channel: window.location.hash || "#default"
    });
    this.chatRoom.on("update", this.onUpdateRemote.bind(this));

    this.state = {
      members: [],
      messages: [],
      points: [],
      count: 0,
      play: false,
      winner: '',
      open: false
    };
    this.tick = this.tick.bind(this);
  }
 
  onUpdateRemote(newState, patches) {
    // let counter;
    console.log("new state: ", newState, "patches:", patches);
    if (this.state.members.length === 1 && newState.members.length === 2) {
      this.setState({ play: true });
      counter = setInterval(this.tick, 1000);    
    } else if (newState.members.length !== 2) {
      clearInterval(counter);
    }
    // console.log('this', newState.points);

    this.setState(newState);
  }
  
  handleOpen () {
    this.setState({ open: true });
  };

  handleClose () {
    this.setState({ open: false });
  };

  tick() {
    this.setState(function(state) {
      return {
        count: state.count+1
      };
    });
  }
  componentDidUpdate() {
    if (this.state.count === 30) {
      clearInterval(counter);
      this.setState({ play: false, count: "Time's up" });
      
      switch(this.state.points.length) {
        case 0:
          this.setState({ winner: 'Draw!'});
          break;
        case 1:
          this.setState({ winner: this.state.points[0].id })
          break;
        case 2: 
          if (this.state.points[0].point > this.state.points[1].point ){
            this.setState({ winner: this.state.points[0].id})
          } else if (this.state.points[0].point < this.state.points[1].point ) {
            this.setState({ winner: this.state.points[1].id})            
          } else {
            this.setState({ winner: 'Draw!'})
          }
      }
      this.setState({ open: true });
    }
  }
 
  handleClick() {
    this.chatRoom.send("clicked");
  }

  render() {
    const { classes } = this.props

    return (
      <Fragment>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <div className={classes.clock}>{this.state.count}</div>
          </Grid>
          <Grid container spacing={24}>
            <Grid item xs={8}>
              <div>
                {this.state.members.length === 2 && `${this.state.members[0]} vs ${this.state.members[1]}`}
                {this.state.messages.map((message, i) => {
                  return <p key={i}> {message} </p>;
                })}
                <div>
                  {this.state.points.map((item, i) => {
                    return <div className={classes.point} key={i}> {`${item.id} has ${item.point} points`} </div>;
                  })}
                </div>
                
              </div>
            </Grid>
            <Grid item xs={4}>
            
              { this.state.play === true ? <Button className={classes.button} onClick={this.handleClick.bind(this)}> Click me </Button> : null}
            </Grid>
          </Grid>
        </Grid>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}
          onClose={this.handleClose.bind(this)}
          className={classes.modal}
        >
          <Grid container spacing={24} className={classes.notify}>
          <Grid item xs={12}>
            <div className={classes.info}>{this.state.winner === "Draw!" && 'Result is draw'}</div>
            <div className={classes.info}>{this.state.winner === '' || this.state.winner === 'Draw!' ? null : `${this.state.winner} has won!!!`}</div>
            </Grid>
          <Grid className={classes.notify} item xs={12}>              
            <Button onClick={this.handleClose.bind(this)}>Ok</Button>
          </Grid>
          </Grid>
        </Modal>
        {/* <button onClick={this.tick}> Test </button>{" "} */}

      </Fragment>
    );
  }
}

export default withStyles(style)(Main);
