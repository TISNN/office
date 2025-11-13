import Peer from 'peerjs'
import Network from '../services/Network'
import store from '../stores'
import { setVideoConnected } from '../stores/UserStore'

export default class WebRTC {
  private myPeer: Peer
  private peers = new Map<string, { call: Peer.MediaConnection; video: HTMLVideoElement }>()
  private onCalledPeers = new Map<string, { call: Peer.MediaConnection; video: HTMLVideoElement }>()
  private videoGrid = document.querySelector('.video-grid')
  private buttonGrid = document.querySelector('.button-grid')
  private myVideo = document.createElement('video')
  private myStream?: MediaStream
  private network: Network
  private broadcastStream?: MediaStream

  constructor(userId: string, network: Network) {
    const sanitizedId = this.replaceInvalidId(userId)
    this.myPeer = new Peer(sanitizedId)
    this.network = network
    console.log('userId:', userId)
    console.log('sanitizedId:', sanitizedId)
    this.myPeer.on('error', (err) => {
      console.log(err.type)
      console.error(err)
    })

    // mute your own video stream (you don't want to hear yourself)
    this.myVideo.muted = true

    // config peerJS
    this.initialize()
  }

  // PeerJS throws invalid_id error if it contains some characters such as that colyseus generates.
  // https://peerjs.com/docs.html#peer-id
  private replaceInvalidId(userId: string) {
    return userId.replace(/[^0-9a-z]/gi, 'G')
  }

  initialize() {
    this.myPeer.on('call', (call) => {
      if (!this.onCalledPeers.has(call.peer)) {
        call.answer(this.myStream)
        const video = document.createElement('video')
        this.onCalledPeers.set(call.peer, { call, video })

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream)
        })
      }
      // on close is triggered manually with deleteOnCalledVideoStream()
    })
  }

  // check if permission has been granted before
  checkPreviousPermission() {
    const permissionName = 'microphone' as PermissionName
    navigator.permissions?.query({ name: permissionName }).then((result) => {
      if (result.state === 'granted') this.getUserMedia(false)
    })
  }

  getUserMedia(alertOnError = true) {
    // ask the browser to get user media
    navigator.mediaDevices
      ?.getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.myStream = stream
        // 确保音频和视频轨道都是启用的
        stream.getAudioTracks().forEach(track => track.enabled = true)
        stream.getVideoTracks().forEach(track => track.enabled = true)
        this.addVideoStream(this.myVideo, this.myStream)
        store.dispatch(setVideoConnected(true))
        this.network.videoConnected()
      })
      .catch((error) => {
        if (alertOnError) window.alert('No webcam or microphone found, or permission is blocked')
      })
  }

  // method to call a peer
  connectToNewUser(userId: string) {
    if (this.myStream) {
      const sanitizedId = this.replaceInvalidId(userId)
      if (!this.peers.has(sanitizedId)) {
        console.log('calling', sanitizedId)
        const call = this.myPeer.call(sanitizedId, this.myStream)
        const video = document.createElement('video')
        this.peers.set(sanitizedId, { call, video })

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream)
        })

        // on close is triggered manually with deleteVideoStream()
      }
    }
  }

  // method to add new video stream to videoGrid div
  addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream
    video.playsInline = true
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    if (this.videoGrid) this.videoGrid.append(video)
  }

  // method to remove video stream (when we are the host of the call)
  deleteVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.peers.has(sanitizedId)) {
      const peer = this.peers.get(sanitizedId)
      peer?.call.close()
      peer?.video.remove()
      this.peers.delete(sanitizedId)
    }
  }

  // method to remove video stream (when we are the guest of the call)
  deleteOnCalledVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.onCalledPeers.has(sanitizedId)) {
      const onCalledPeer = this.onCalledPeers.get(sanitizedId)
      onCalledPeer?.call.close()
      onCalledPeer?.video.remove()
      this.onCalledPeers.delete(sanitizedId)
    }
  }

  // method to set up mute/unmute and video on/off buttons
  setUpButtons() {
    const audioButton = document.createElement('button')
    audioButton.innerText = 'Mute'
    audioButton.addEventListener('click', () => {
      if (this.myStream) {
        const audioTrack = this.myStream.getAudioTracks()[0]
        if (audioTrack.enabled) {
          audioTrack.enabled = false
          audioButton.innerText = 'Unmute'
        } else {
          audioTrack.enabled = true
          audioButton.innerText = 'Mute'
        }
      }
    })
    const videoButton = document.createElement('button')
    videoButton.innerText = 'Video off'
    videoButton.addEventListener('click', () => {
      if (this.myStream) {
        const audioTrack = this.myStream.getVideoTracks()[0]
        if (audioTrack.enabled) {
          audioTrack.enabled = false
          videoButton.innerText = 'Video on'
        } else {
          audioTrack.enabled = true
          videoButton.innerText = 'Video off'
        }
      }
    })
    this.buttonGrid?.append(audioButton)
    this.buttonGrid?.append(videoButton)
  }

  // 修改停止视频流的方法
  stopVideoStream() {
    if (this.myStream) {
      // 停止所有视频轨道
      const videoTracks = this.myStream.getVideoTracks()
      videoTracks.forEach(track => {
        track.stop()  // 完全停止轨道
        this.myStream?.removeTrack(track)  // 从流中移除轨道
      })
      
      // 移除视频元素
      if (this.myVideo.srcObject) {
        this.myVideo.srcObject = null
      }
      this.myVideo.remove()
      
      // 通知其他用户视频已关闭
      store.dispatch(setVideoConnected(false))
    }
  }

  // 修改重启视频流的方法
  restartVideoStream() {
    // 创建新的视频元素
    this.myVideo = document.createElement('video')
    this.myVideo.muted = true
    
    // 重新获取媒体流
    navigator.mediaDevices
      ?.getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.myStream = stream
        this.addVideoStream(this.myVideo, this.myStream)
        store.dispatch(setVideoConnected(true))
        this.network.videoConnected()
      })
      .catch((error) => {
        console.error('Failed to get user media:', error)
      })
  }

  // 添加停止音频流的方法
  stopAudioStream() {
    if (this.myStream) {
      // 停止所有音频轨道
      const audioTracks = this.myStream.getAudioTracks()
      audioTracks.forEach(track => {
        track.stop()  // 完全停止轨道
        this.myStream?.removeTrack(track)  // 从流中移除轨道
      })
    }
  }

  // 添加重启音频流的方法
  restartAudioStream() {
    // 重新获取仅音频的媒体流
    navigator.mediaDevices
      ?.getUserMedia({
        audio: true,
      })
      .then((audioStream) => {
        // 将新的音频轨道添加到现有流中
        if (this.myStream) {
          audioStream.getAudioTracks().forEach(track => {
            this.myStream?.addTrack(track)
          })
        }
      })
      .catch((error) => {
        console.error('Failed to get audio stream:', error)
      })
  }

  // 开始广播
  startBroadcast() {
    if (this.myStream) {
      // 创建一个新的音频上下文
      const audioContext = new AudioContext()
      const destination = audioContext.createMediaStreamDestination()
      
      // 获取当前的音频轨道并增强它
      const source = audioContext.createMediaStreamSource(this.myStream)
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 2.0 // 增加音量
      
      // 连接节点
      source.connect(gainNode)
      gainNode.connect(destination)
      
      // 保存广播流以便后续停止
      this.broadcastStream = destination.stream
      
      // 向所有连接的对等点发送广播流
      this.peers.forEach(({ call }) => {
        const broadcastCall = this.myPeer.call(call.peer, this.broadcastStream!)
        broadcastCall.on('close', () => {
          broadcastCall.close()
        })
      })

      // 显示广播状态提示
      this.showBroadcastNotification(true)
    }
  }

  // 停止广播
  stopBroadcast() {
    if (this.broadcastStream) {
      // 停止所有轨道
      this.broadcastStream.getTracks().forEach(track => {
        track.stop()
      })
      this.broadcastStream = undefined

      // 显示广播已停止提示
      this.showBroadcastNotification(false)
    }
  }

  // 显示广播状态提示
  private showBroadcastNotification(isStarting: boolean) {
    const notification = document.createElement('div')
    notification.style.position = 'fixed'
    notification.style.top = '20px'
    notification.style.left = '50%'
    notification.style.transform = 'translateX(-50%)'
    notification.style.backgroundColor = isStarting ? '#4CAF50' : '#f44336'
    notification.style.color = 'white'
    notification.style.padding = '12px 24px'
    notification.style.borderRadius = '4px'
    notification.style.zIndex = '9999'
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)'
    notification.textContent = isStarting ? '你正在向房间广播' : '广播已停止'

    document.body.appendChild(notification)
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
}
