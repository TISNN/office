import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  Avatar
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import { useAppSelector } from '../hooks'
import { getAvatarString, getColorByString } from '../util'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#222639',
    borderRadius: '16px',
    minWidth: '400px',
    maxWidth: '400px',
    color: '#fff',
  },
}))

const DialogHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  '& .MuiIconButton-root': {
    color: '#fff',
  },
})

const InviteContent = styled(DialogContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  padding: '24px',
})

const RoomInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  '& .MuiAvatar-root': {
    width: 48,
    height: 48,
  }
})

const InviteLink = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

const LinkBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '12px 16px',
  '& .link-text': {
    flex: 1,
    wordBreak: 'break-all',
    fontSize: '14px',
    color: '#888',
    fontFamily: 'monospace',
  },
})

const CopyButton = styled(Button)({
  backgroundColor: '#4CAF50',
  color: '#fff',
  padding: '6px 16px',
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#43a047'
  }
})

interface Props {
  open: boolean
  onClose: () => void
}

export default function InviteDialog({ open, onClose }: Props) {
  const [showCopied, setShowCopied] = useState(false)
  const roomId = useAppSelector((state) => state.room.roomId)
  const roomName = useAppSelector((state) => state.room.roomName)

  const inviteLink = `${window.location.origin}/invite/${roomId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setShowCopied(true)
  }

  return (
    <>
      <StyledDialog open={open} onClose={onClose}>
        <DialogHeader>
          <DialogTitle sx={{ p: 0, m: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShareIcon sx={{ fontSize: 24 }} />
            邀请参与者
          </DialogTitle>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogHeader>
        <InviteContent>
          <RoomInfo>
            <Avatar 
              sx={{ bgcolor: getColorByString(roomName) }}
            >
              {getAvatarString(roomName)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                {roomName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888' }}>
                分享链接邀请其他人加入房间
              </Typography>
            </Box>
          </RoomInfo>

          <InviteLink>
            <Typography variant="subtitle2" sx={{ color: '#888', fontWeight: 500 }}>
              房间邀请链接
            </Typography>
            <LinkBox>
              <Typography className="link-text">{inviteLink}</Typography>
              <CopyButton
                variant="contained"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopy}
                disableElevation
              >
                复制链接
              </CopyButton>
            </LinkBox>
          </InviteLink>
        </InviteContent>
      </StyledDialog>
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            backgroundColor: '#43a047',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
        >
          邀请链接已复制到剪贴板
        </Alert>
      </Snackbar>
    </>
  )
} 