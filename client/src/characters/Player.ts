import Phaser from 'phaser'
import { PlayerBehavior } from '../../../types/PlayerBehavior'

/**
 * shifting distance for sitting animation
 * format: direction: [xShift, yShift, depthShift]
 */
export const sittingShiftData = {
  up: [0, 3, -10],
  down: [0, 3, 1],
  left: [0, -8, 10],
  right: [0, -8, 10],
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  playerId: string
  playerTexture: string
  playerBehavior = PlayerBehavior.IDLE
  readyToConnect = false
  videoConnected = false
  playerName: Phaser.GameObjects.Text
  playerContainer: Phaser.GameObjects.Container
  private playerDialogBubble: Phaser.GameObjects.Container
  private timeoutID?: number
  private playerNameBackground: Phaser.GameObjects.Graphics
  private playerStatusCircle: Phaser.GameObjects.Arc
  private currentStatus: 'online' | 'busy' = 'online'

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame)

    this.playerId = id
    this.playerTexture = texture
    this.setDepth(this.y)

    this.anims.play(`${this.playerTexture}_idle_down`, true)

    // 创建一个固定位置的容器
    this.playerContainer = this.scene.add.container(x, y - 45)
    this.playerContainer.setDepth(5000)

    // add dialogBubble to playerContainer
    this.playerDialogBubble = this.scene.add.container(0, 0).setDepth(5000)
    this.playerContainer.add(this.playerDialogBubble)

    // add playerName to playerContainer
    this.playerName = this.scene.add
      .text(0, 0, '')
      .setFontFamily('Arial')
      .setFontSize(12)
      .setColor('#ffffff')
      .setOrigin(0.5)

    // 添加黑色背景
    this.playerNameBackground = this.scene.add.graphics()
    this.updateNameBackground()
    
    // 添加状态圆圈，调整y轴位置使其垂直居中
    this.playerStatusCircle = this.scene.add.circle(
      -this.playerName.width / 2 - 8, 
      0,
      3,
      0x44b700
    )

    // 将背景和状态圆圈添加到容器中（注意添加顺序，背景在最底层）
    this.playerContainer.add(this.playerNameBackground)
    this.playerContainer.add(this.playerStatusCircle)
    this.playerContainer.add(this.playerName)

    // 更新容器位置的方法
    this.scene.events.on('update', () => {
      this.playerContainer.setPosition(this.x, this.y - 45)
    })

    this.scene.physics.world.enable(this.playerContainer)
    const playContainerBody = this.playerContainer.body as Phaser.Physics.Arcade.Body
    const collisionScale = [0.5, 0.2]
    playContainerBody
      .setSize(this.width * collisionScale[0], this.height * collisionScale[1])
      .setOffset(-8, this.height * (1 - collisionScale[1]) + 6)
  }

  // 更新名字背景
  private updateNameBackground() {
    this.playerNameBackground.clear()
    const padding = 4
    const width = this.playerName.width + padding * 4 + 12 // 调整额外宽度
    const height = this.playerName.height + padding * 2
    this.playerNameBackground
      .fillStyle(0x000000, 0.6)
      .fillRoundedRect(
        -width / 2,
        -height / 2,
        width,
        height,
        4
      )
  }

  // 更新状态圆圈
  updateStatus(status: 'online' | 'busy') {
    this.currentStatus = status
    if (this.playerStatusCircle) {
      this.playerStatusCircle
        .setPosition(-this.playerName.width / 2 - 8, 0)
        .setFillStyle(status === 'online' ? 0x44b700 : 0xff0000)
        .setAlpha(1)
        .setDepth(5001)
    }
  }

  updateDialogBubble(content: string) {
    this.clearDialogBubble()

    // preprocessing for dialog bubble text (maximum 70 characters)
    const dialogBubbleText = content.length <= 70 ? content : content.substring(0, 70).concat('...')

    const innerText = this.scene.add
      .text(0, 0, dialogBubbleText, { wordWrap: { width: 165, useAdvancedWrap: true } })
      .setFontFamily('Arial')
      .setFontSize(12)
      .setColor('#000000')
      .setOrigin(0.5)

    // set dialogBox slightly larger than the text in it
    const innerTextHeight = innerText.height
    const innerTextWidth = innerText.width

    innerText.setY(-innerTextHeight / 2 - this.playerName.height / 2)
    const dialogBoxWidth = innerTextWidth + 10
    const dialogBoxHeight = innerTextHeight + 3
    const dialogBoxX = innerText.x - innerTextWidth / 2 - 5
    const dialogBoxY = innerText.y - innerTextHeight / 2 - 2

    this.playerDialogBubble.add(
      this.scene.add
        .graphics()
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(dialogBoxX, dialogBoxY, dialogBoxWidth, dialogBoxHeight, 3)
        .lineStyle(1, 0x000000, 1)
        .strokeRoundedRect(dialogBoxX, dialogBoxY, dialogBoxWidth, dialogBoxHeight, 3)
    )
    this.playerDialogBubble.add(innerText)

    // After 6 seconds, clear the dialog bubble
    this.timeoutID = window.setTimeout(() => {
      this.clearDialogBubble()
    }, 6000)
  }

  private clearDialogBubble() {
    clearTimeout(this.timeoutID)
    this.playerDialogBubble.removeAll(true)
  }

  // 当设置玩家名字时更新背景和状态圆圈位置
  setPlayerName(name: string) {
    this.playerName.setText(name)
    this.updateNameBackground()
    // 更新状态圆圈位置
    if (this.playerStatusCircle) {
      this.playerStatusCircle.setPosition(-this.playerName.width / 2 - 8, 0)
    }
  }
}
