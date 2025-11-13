import React, { useState } from 'react'
import styled from 'styled-components'
import { useAppSelector, useAppDispatch } from './hooks'
import { setShowChat } from './stores/ChatStore'
import phaserGame from './PhaserGame'
import Game from './scenes/Game'

import RoomSelectionDialog from './components/RoomSelectionDialog'
import LoginDialog from './components/LoginDialog'
import ComputerDialog from './components/ComputerDialog'
import WhiteboardDialog from './components/WhiteboardDialog'
import VideoConnectionDialog from './components/VideoConnectionDialog'
import Chat from './components/Chat'
import BottomBar from './components/BottomBar'
import MobileVirtualJoystick from './components/MobileVirtualJoystick'
import PeopleList from './components/PeopleList'

const Backdrop = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`

function App() {
  const dispatch = useAppDispatch()
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [screenShareEnabled, setScreenShareEnabled] = useState(false)
  const [showPeopleList, setShowPeopleList] = useState(false)
  const [broadcastEnabled, setBroadcastEnabled] = useState(false)
  
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const computerDialogOpen = useAppSelector((state) => state.computer.computerDialogOpen)
  const whiteboardDialogOpen = useAppSelector((state) => state.whiteboard.whiteboardDialogOpen)
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const showJoystick = useAppSelector((state) => state.user.showJoystick)

  const handleVideoClick = () => {
    const game = phaserGame.scene.keys.game as Game
    if (!videoEnabled) {
      // 如果要开启视频，重新获取视频流
      game.network?.webRTC?.restartVideoStream()
      setVideoEnabled(true)
    } else {
      // 如果要关闭视频，完全停止视频流
      game.network?.webRTC?.stopVideoStream()
      setVideoEnabled(false)
    }
  }

  const handleAudioClick = () => {
    const game = phaserGame.scene.keys.game as Game
    if (!audioEnabled) {
      // 如果要开启音频，重新获取音频流
      game.network?.webRTC?.restartAudioStream()
      setAudioEnabled(true)
    } else {
      // 如果要关闭音频，完全停止音频流
      game.network?.webRTC?.stopAudioStream()
      setAudioEnabled(false)
    }
  }

  const handleScreenShareClick = () => {
    setScreenShareEnabled(!screenShareEnabled)
  }

  const handleChatClick = () => {
    dispatch(setShowChat(!showChat))
  }

  const handlePeopleClick = () => {
    setShowPeopleList(!showPeopleList)
  }

  const handleLeaveClick = () => {
    window.location.reload()
  }

  const handleBroadcastClick = () => {
    const game = phaserGame.scene.keys.game as Game
    if (!broadcastEnabled) {
      // 开始广播
      game.network?.webRTC?.startBroadcast()
      setBroadcastEnabled(true)
    } else {
      // 停止广播
      game.network?.webRTC?.stopBroadcast()
      setBroadcastEnabled(false)
    }
  }

  let ui: JSX.Element
  if (loggedIn) {
    if (computerDialogOpen) {
      /* Render ComputerDialog if user is using a computer. */
      ui = <ComputerDialog />
    } else if (whiteboardDialogOpen) {
      /* Render WhiteboardDialog if user is using a whiteboard. */
      ui = <WhiteboardDialog />
    } else {
      ui = (
        /* Render Chat or VideoConnectionDialog if no dialogs are opened. */
        <>
          <Chat />
          {/* Render VideoConnectionDialog if user is not connected to a webcam. */}
          {!videoConnected && <VideoConnectionDialog />}
          {showJoystick && <MobileVirtualJoystick />}
          <BottomBar 
            onVideoClick={handleVideoClick}
            onAudioClick={handleAudioClick}
            onScreenShareClick={handleScreenShareClick}
            onChatClick={handleChatClick}
            onPeopleClick={handlePeopleClick}
            onLeaveClick={handleLeaveClick}
            onBroadcastClick={handleBroadcastClick}
            videoEnabled={videoEnabled}
            audioEnabled={audioEnabled}
            screenShareEnabled={screenShareEnabled}
            broadcastEnabled={broadcastEnabled}
          />
          {showPeopleList && <PeopleList onClose={() => setShowPeopleList(false)} />}
        </>
      )
    }
  } else if (roomJoined) {
    /* Render LoginDialog if not logged in but selected a room. */
    ui = <LoginDialog />
  } else {
    /* Render RoomSelectionDialog if yet selected a room. */
    ui = <RoomSelectionDialog />
  }

  return (
    <Backdrop>
      {ui}
    </Backdrop>
  )
}

export default App
