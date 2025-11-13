import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { sanitizeId } from '../util'
import { BackgroundMode } from '../../../types/BackgroundMode'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

export function getInitialBackgroundMode() {
  const currentHour = new Date().getHours()
  return currentHour > 6 && currentHour <= 18 ? BackgroundMode.DAY : BackgroundMode.NIGHT
}

interface UserState {
  backgroundMode: BackgroundMode
  sessionId: string
  videoConnected: boolean
  loggedIn: boolean
  playerNameMap: Map<string, string>
  showJoystick: boolean
  userName: string
  avatarId: string
  userStatus: 'online' | 'busy'
}

const initialState: UserState = {
  backgroundMode: BackgroundMode.DAY,
  sessionId: '',
  videoConnected: false,
  loggedIn: false,
  playerNameMap: new Map(),
  showJoystick: window.innerWidth < 650,
  userName: '',
  avatarId: '',
  userStatus: 'online'
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    toggleBackgroundMode: (state) => {
      const newMode =
        state.backgroundMode === BackgroundMode.DAY ? BackgroundMode.NIGHT : BackgroundMode.DAY

      state.backgroundMode = newMode
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
      bootstrap.changeBackgroundMode(newMode)
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload
    },
    setVideoConnected: (state, action: PayloadAction<boolean>) => {
      state.videoConnected = action.payload
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.loggedIn = action.payload
    },
    setPlayerNameMap: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.playerNameMap.set(sanitizeId(action.payload.id), action.payload.name)
    },
    removePlayerNameMap: (state, action: PayloadAction<string>) => {
      state.playerNameMap.delete(sanitizeId(action.payload))
    },
    setShowJoystick: (state, action: PayloadAction<boolean>) => {
      state.showJoystick = action.payload
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload
    },
    setUserAvatar: (state, action: PayloadAction<string>) => {
      state.avatarId = action.payload
    },
    setUserStatus: (state, action: PayloadAction<'online' | 'busy'>) => {
      state.userStatus = action.payload
    }
  },
})

export const {
  toggleBackgroundMode,
  setSessionId,
  setVideoConnected,
  setLoggedIn,
  setPlayerNameMap,
  removePlayerNameMap,
  setShowJoystick,
  setUserName,
  setUserAvatar,
  setUserStatus
} = userSlice.actions

export default userSlice.reducer
