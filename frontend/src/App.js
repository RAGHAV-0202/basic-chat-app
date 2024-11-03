import './App.css';
import "./index.css"
import React from 'react';
import { io } from 'socket.io-client';

const socket = io('https://basic-chat-app-8brn.onrender.com/')

function JoinRoom({setStage , setRoomId , setName}){

  const roomIdContainer = React.useRef(null)
  const nameContainer = React.useRef(null)


  const handleJoin = async(e)=>{
    e.preventDefault()
    const roomId = roomIdContainer.current.value ;
    const name = nameContainer.current.value
    

    socket.emit('joinRoom', {roomId , name});

    roomIdContainer.current.value = ""
    nameContainer.current.value = ""
    
    setName(name)
    setRoomId(roomId)
    setStage(1)

  }

  return(
    <form onSubmit={handleJoin} className='flex JoinRoomDiv bgLBlue col'>
      <input ref={roomIdContainer} required className='p-3 flex center' type='number' placeholder='Enter Room ID'></input>

      <input ref={nameContainer} required className='p-3 flex center' type='text' placeholder='Enter your Name'></input>

      <button type='submit'>Join Room</button>

    </form>
  )
}

const Room = ({stage , setStage , roomId , name})=>{

  const [messages, setMessages] = React.useState([]);
  const messageInpuContainer = React.useRef(null)
  const messageAreaRef = React.useRef(null); 

  React.useEffect(() => {
    const messageHandler = ({ userId, message, name }) => {
      console.log(`new message from ${name}: ${message}`);
      setMessages(prevMessages => [...prevMessages, { userId, message, name }]);
    };

    socket.on('message', messageHandler);

  
    return () => {
      socket.off('message', messageHandler);
    };
  }, []); 

  const handleSendMessage = (e) => {
    e.preventDefault();
    const newMessage = messageInpuContainer.current.value;
    if (newMessage.trim()) {
      socket.emit('sendMessage', { roomId, message: newMessage, name });
      messageInpuContainer.current.value = "";
    }
  };

  React.useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);


  return(
    <div className='Room flex col p-3'>
      <h1>Room ID : {roomId}</h1>
      <div ref={messageAreaRef} className='area_for_messages p-3 flex col'>
        {messages.map((msg, index) => {
          const style = msg.userId === socket.id ? {display : "none"} : {}
          return(
            <div key={index} className={msg.userId === socket.id ? 'user-message' : 'other-message'}>

              <p><span style={style} className='nameAreaMessage'>{msg.name}</span>{msg.message}</p>
            </div>
        )})}
      </div>
      <form onSubmit={handleSendMessage} className='input_area flex row center'>
        <input className='p-3' ref={messageInpuContainer} placeholder='Enter your message'></input>
        <button className='flex center' type='submit'>Send Message</button>
      </form>
    </div>
  )
}


function App() {

  const [stage , setStage] = React.useState(0);
  const [roomId , setRoomId] = React.useState(null)
  const [name , setName] = React.useState(null)

  React.useEffect(() => {
      return () => {
          socket.disconnect();
      };
  }, []);

  return (
    <div className="App min100 center">
        {stage === 0 && 
          <JoinRoom 
            stage = {stage} 
            setStage = {setStage}
            setRoomId = {setRoomId}
            setName = {setName}
          />
        }

        {stage === 1 && 
          <Room
            roomId = {roomId}
            name = {name}
          />
        }
    </div>
  );
}

export default App;
