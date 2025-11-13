import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { 
  Box,
  Typography,
  IconButton,
  InputBase,
  Avatar,
  Button,
  Tooltip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CircleIcon from '@mui/icons-material/Circle'
import { useAppSelector } from '../hooks'
import { getAvatarString, getColorByString } from '../util'
import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'
import InviteDialog from './InviteDialog'

const avatarImages = {
  adam: Adam,
  ash: Ash,
  lucy: Lucy,
  nancy: Nancy,
}

const Wrapper = styled(Box)({
  position: 'fixed',
  right: '16px',
  top: '16px',
  bottom: '76px',
  width: '300px',
  backgroundColor: '#222639',
  borderRadius: '16px',
  boxShadow: '0px 0px 5px #0000006f',
  color: '#fff',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  zIndex: 1000,
})

const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '& .MuiTypography-root': {
    fontWeight: 'bold',
    fontSize: '20px',
  }
})

const SearchBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: '#1e1e1e',
  borderRadius: '8px',
  padding: '8px 12px',
  '& .MuiInputBase-root': {
    color: '#fff',
    fontSize: '14px',
    width: '100%',
  }
})

const RoomInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#1e1e1e',
  borderRadius: '8px',
  '& .MuiAvatar-root': {
    width: 40,
    height: 40,
  }
})

const PeopleListContainer = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '5px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#1e1e1e',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '3px',
  }
})

const PersonItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#1e1e1e',
  },
  '& .MuiAvatar-root': {
    width: 32,
    height: 32,
  }
})

const CustomAvatar = styled(Avatar)({
  width: 32,
  height: 32,
  '& img': {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  }
})

const RoomAvatar = styled(Avatar)({
  width: 40,
  height: 40,
})

interface Props {
  onClose: () => void
}

export default function PeopleList({ onClose }: Props) {
  const [searchText, setSearchText] = useState('')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const roomName = useAppSelector((state) => state.room.roomName)
  const playerNameMap = useAppSelector((state) => state.user.playerNameMap)
  const userName = useAppSelector((state) => state.user.userName)
  const userStatus = useAppSelector((state) => state.user.userStatus)
  const userAvatarId = useAppSelector((state) => state.user.avatarId)

  // 创建包含当前用户和其他用户的完整列表
  const allPlayers = [
    // 添加当前用户
    { 
      id: 'current', 
      name: userName, 
      status: userStatus,
      avatarId: userAvatarId
    },
    // 添加其他用户
    ...Array.from(playerNameMap.entries()).map(([id, name]) => ({
      id,
      name,
      status: 'online',
      avatarId: 'adam' // 默认头像，实际应该从用户数据中获取
    }))
  ]

  // 过滤搜索结果
  const filteredPlayers = allPlayers
    .filter(player => player.name.toLowerCase().includes(searchText.toLowerCase()))
    // 确保不重复显示当前用户
    .filter((player, index, self) => 
      index === self.findIndex(p => p.name === player.name)
    )

  return (
    <Wrapper>
      <Header>
        <Typography>参与者</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ color: '#fff' }} />
        </IconButton>
      </Header>

      <SearchBox>
        <SearchIcon sx={{ color: '#666' }} />
        <InputBase 
          placeholder="搜索参与者..." 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </SearchBox>

      <RoomInfo>
        <RoomAvatar style={{ background: getColorByString(roomName) }}>
          {getAvatarString(roomName)}
        </RoomAvatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{roomName}</Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {filteredPlayers.length} 位参与者
          </Typography>
        </Box>
        <Tooltip title="邀请">
          <IconButton size="small" onClick={() => setShowInviteDialog(true)}>
            <PersonAddIcon sx={{ color: '#fff' }} />
          </IconButton>
        </Tooltip>
      </RoomInfo>

      <PeopleListContainer>
        {filteredPlayers.map((player) => (
          <PersonItem key={player.id}>
            <CustomAvatar>
              <img 
                src={avatarImages[player.avatarId as keyof typeof avatarImages]} 
                alt={player.name} 
              />
            </CustomAvatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1">
                {player.name} {player.name === userName && '(我)'}
              </Typography>
            </Box>
            <CircleIcon 
              sx={{ 
                fontSize: 12,
                color: player.status === 'online' ? '#44b700' : '#ff0000',
                filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
              }} 
            />
          </PersonItem>
        ))}
      </PeopleListContainer>

      <InviteDialog 
        open={showInviteDialog} 
        onClose={() => setShowInviteDialog(false)} 
      />
    </Wrapper>
  )
} 