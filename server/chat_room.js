var Room = require('colyseus').Room

class ChatRoom extends Room {
  constructor (options) {
    // call 'update' method each 50ms
    super(options)

    this.channel = options.channel;

    this.setPatchRate(1000 / 20);

    this.setState({
      messages: [ `Welcome to ${ options.channel } PlayRoom instance.` ],
      points: [],
      members: []
    })
  }
  

  requestJoin (options) {
    return options.channel === this.channel;
  }

  onJoin (client) {
    console.log(client.id, "joined Room!")
    this.state.messages.push(`${ client.id } joined. Let's play!`)
    this.state.members.push(client.id);
  }

  onMessage (client, data) {
    if (data === 'clicked') {
      // console.log(client.id, "clicked on the button")
      if (this.state.points.filter(p => p.id === client.id).length === 0 ) {
        this.state.points.push({ id: client.id, point: 0});
        // console.log('obj', { id: client.id, point: 0});
      }
      else if (this.state.points.filter(p => p.id === client.id).length === 1) {
        // console.log('test1', this.state.points)
        const test = this.state.points.filter(p => p.id === client.id);
        const rest = this.state.points.filter(p => p.id !== client.id);
        const newPoint = Object.assign(test[0], { point: test[0].point + 1 });
        // this.state.points.push(newPoint);
        
      }
    }
  }

  onLeave (client) {
    console.log(client.id, "left ChatRoom")
    this.state.messages.push(`${ client.id } left.`)
    this.state.members.pop(client.id);
  }
}

module.exports = ChatRoom
