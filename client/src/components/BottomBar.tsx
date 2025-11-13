import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Box, IconButton, Tooltip, Divider, Avatar, Typography, AppBar, Toolbar, Stack } from '@mui/material'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import LogoutIcon from '@mui/icons-material/Logout'
import ChatIcon from '@mui/icons-material/Chat'
import PeopleIcon from '@mui/icons-material/People'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ShareIcon from '@mui/icons-material/Share'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff'
import CloseIcon from '@mui/icons-material/Close'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import CircleIcon from '@mui/icons-material/Circle'
import CampaignIcon from '@mui/icons-material/Campaign'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import { useAppSelector, useAppDispatch } from '../hooks'
import { BackgroundMode } from '../../../types/BackgroundMode'
import { setShowJoystick, toggleBackgroundMode, setUserStatus } from '../stores/UserStore'
import { getAvatarString, getColorByString } from '../util'
import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'
import { phaserEvents, Event } from '../events/EventCenter'
import PeopleList from './PeopleList'

const avatarImages = {
  adam: Adam,
  ash: Ash,
  lucy: Lucy,
  nancy: Nancy,
}

const BottomBarContainer = styled(Box)({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#1e1e1e',
  padding: '0 16px',
  gap: '8px',
  '& .MuiIconButton-root': {
    color: 'white',
  },
  '& .enabled': {
    color: '#4CAF50 !important',
  },
  '& .disabled': {
    color: '#f44336 !important',
  }
})

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '0 12px',
  '& .MuiAvatar-root': {
    width: 36,
    height: 36,
  },
  '& .name-status-wrapper': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  '& .user-name': {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 500,
  }
})

const ButtonGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

const StyledDivider = styled(Divider)({
  height: '24px',
  borderColor: 'rgba(255, 255, 255, 0.3)',
})

const InfoWrapper = styled(Box)({
  position: 'fixed',
  bottom: '80px',
  right: '16px',
  fontSize: '16px',
  color: '#eee',
  background: '#222639',
  boxShadow: '0px 0px 5px #0000006f',
  borderRadius: '16px',
  padding: '15px 35px 15px 15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '& .close': {
    position: 'absolute',
    top: '15px',
    right: '15px',
  },
  '& .tip': {
    marginLeft: '12px',
  }
})

const RoomName = styled(Box)({
  margin: '10px 20px',
  maxWidth: '460px',
  maxHeight: '150px',
  overflowWrap: 'anywhere',
  overflowY: 'auto',
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
  alignItems: 'center',
  '& h3': {
    fontSize: '24px',
    color: '#eee',
  }
})

const RoomDescription = styled(Box)({
  margin: '0 20px',
  maxWidth: '460px',
  maxHeight: '150px',
  overflowWrap: 'anywhere',
  overflowY: 'auto',
  fontSize: '16px',
  color: '#c2c2c2',
  display: 'flex',
  justifyContent: 'center',
})

const GuideWrapper = styled(Box)({
  position: 'fixed',
  bottom: '80px',
  right: '16px',
  fontSize: '16px',
  color: '#eee',
  background: '#222639',
  boxShadow: '0px 0px 5px #0000006f',
  borderRadius: '16px',
  padding: '15px 35px 15px 15px',
  '& .close': {
    position: 'absolute',
    top: '15px',
    right: '15px',
  },
  '& h3': {
    fontSize: '24px',
    color: '#eee',
    textAlign: 'center',
  },
  '& .tip': {
    marginLeft: '12px',
  }
})

const UserAvatar = styled(Avatar)({
  width: 36,
  height: 36,
  '& img': {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  }
})

const UserStatusWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.05)',
  }
})

const StatusDot = styled(CircleIcon)({
  fontSize: '12px',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.2)',
      opacity: 0.8,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
})

interface Props {
  onVideoClick: () => void
  onAudioClick: () => void
  onScreenShareClick: () => void
  onChatClick: () => void
  onPeopleClick: () => void
  onLeaveClick: () => void
  onBroadcastClick: () => void
  videoEnabled: boolean
  audioEnabled: boolean
  screenShareEnabled: boolean
  broadcastEnabled: boolean
}

const BottomBar = ({
  onVideoClick,
  onAudioClick,
  onScreenShareClick,
  onChatClick,
  onPeopleClick,
  onLeaveClick,
  onBroadcastClick,
  videoEnabled,
  audioEnabled,
  screenShareEnabled,
  broadcastEnabled,
}: Props) => {
  const dispatch = useAppDispatch()
  const [showControlGuide, setShowControlGuide] = useState(false)
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const showJoystick = useAppSelector((state) => state.user.showJoystick)
  const backgroundMode = useAppSelector((state) => state.user.backgroundMode)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const roomId = useAppSelector((state) => state.room.roomId)
  const roomName = useAppSelector((state) => state.room.roomName)
  const roomDescription = useAppSelector((state) => state.room.roomDescription)
  const userName = useAppSelector((state) => state.user.userName)
  const avatarId = useAppSelector((state) => state.user.avatarId)
  const userStatus = useAppSelector((state) => state.user.userStatus)
  const [showPeopleList, setShowPeopleList] = useState(false)

  const handleStatusClick = () => {
    const newStatus = userStatus === 'online' ? 'busy' : 'online'
    phaserEvents.emit(Event.MY_PLAYER_STATUS_CHANGE, newStatus)
    dispatch(setUserStatus(newStatus))
  }

  return (
    <>
      {showRoomInfo && (
        <InfoWrapper>
          <IconButton className="close" onClick={() => setShowRoomInfo(false)} size="small">
            <CloseIcon />
          </IconButton>
          <RoomName>
            <Avatar style={{ background: getColorByString(roomName) }}>
              {getAvatarString(roomName)}
            </Avatar>
            <h3>{roomName}</h3>
          </RoomName>
          <RoomDescription>
            <ArrowRightIcon /> 房间ID: {roomId}
          </RoomDescription>
          <RoomDescription>
            <ArrowRightIcon /> 房间描述: {roomDescription}
          </RoomDescription>
          <p className="tip">
            <LightbulbIcon />
            可分享的链接即将推出 😄
          </p>
        </InfoWrapper>
      )}

      {showControlGuide && (
        <GuideWrapper>
          <h3>控制说明</h3>
          <IconButton className="close" onClick={() => setShowControlGuide(false)} size="small">
            <CloseIcon />
          </IconButton>
          <ul>
            <li>
              <strong>W, A, S, D 或方向键</strong> 移动
            </li>
            <li>
              <strong>E</strong> 坐下（面对椅子时）
            </li>
            <li>
              <strong>R</strong> 使用电脑进行屏幕共享（面对电脑时）
            </li>
            <li>
              <strong>Enter</strong> 打开聊天
            </li>
            <li>
              <strong>ESC</strong> 关闭聊天
            </li>
          </ul>
          <p className="tip">
            <LightbulbIcon />
            当你靠近其他人时，视频连接将自动开始
          </p>
        </GuideWrapper>
      )}

      <BottomBarContainer>
        <UserInfo>
          <UserAvatar>
            <img src={avatarImages[avatarId as keyof typeof avatarImages]} alt={userName} />
          </UserAvatar>
          <Box className="name-status-wrapper">
            <Typography className="user-name">{userName}</Typography>
            <Tooltip title={userStatus === 'online' ? "点击切换为勿扰状态" : "点击切换为在线状态"} arrow>
              <UserStatusWrapper onClick={handleStatusClick}>
                <StatusDot sx={{ 
                  fontSize: '10px',
                  color: userStatus === 'online' ? '#44b700' : '#ff0000',
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                }} />
                <Typography sx={{ 
                  fontSize: '12px',
                  color: userStatus === 'online' ? '#44b700' : '#ff0000',
                  fontWeight: 500
                }}>
                  {userStatus === 'online' ? '在线' : '勿扰'}
                </Typography>
              </UserStatusWrapper>
            </Tooltip>
          </Box>
        </UserInfo>

        <ButtonGroup>
          <Tooltip title={videoEnabled ? "关闭视频" : "开启视频"}>
            <IconButton onClick={onVideoClick} className={videoEnabled ? 'enabled' : 'disabled'}>
              {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={audioEnabled ? "关闭音频" : "开启音频"}>
            <IconButton onClick={onAudioClick} className={audioEnabled ? 'enabled' : 'disabled'}>
              {audioEnabled ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={screenShareEnabled ? "停止共享" : "屏幕共享"}>
            <IconButton onClick={onScreenShareClick}>
              {screenShareEnabled ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={broadcastEnabled ? "停止广播" : "开始广播"}>
            <IconButton 
              onClick={onBroadcastClick} 
              className={broadcastEnabled ? 'enabled' : ''}
              sx={{
                animation: broadcastEnabled ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.8,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            >
              {broadcastEnabled ? <CampaignIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Tooltip>
          <StyledDivider orientation="vertical" flexItem />
          <Tooltip title="聊天">
            <IconButton onClick={onChatClick}>
              <ChatIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="参与者">
            <IconButton onClick={onPeopleClick}>
              <PeopleIcon />
            </IconButton>
          </Tooltip>
          <StyledDivider orientation="vertical" flexItem />
          {roomJoined && (
            <>
              <Tooltip title={showJoystick ? "禁用虚拟摇杆" : "启用虚拟摇杆"}>
                <IconButton onClick={() => dispatch(setShowJoystick(!showJoystick))}>
                  {showJoystick ? <VideogameAssetOffIcon /> : <VideogameAssetIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="房间信息">
                <IconButton onClick={() => setShowRoomInfo(!showRoomInfo)}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="控制指南">
                <IconButton onClick={() => setShowControlGuide(!showControlGuide)}>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="切换背景主题">
            <IconButton onClick={() => dispatch(toggleBackgroundMode())}>
              {backgroundMode === BackgroundMode.DAY ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          <StyledDivider orientation="vertical" flexItem />
          <Tooltip title="离开">
            <IconButton onClick={onLeaveClick} sx={{ color: '#ff4d4d !important' }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </BottomBarContainer>
      {showPeopleList && <PeopleList onClose={() => setShowPeopleList(false)} />}
    </>
  )
}

export default BottomBar 