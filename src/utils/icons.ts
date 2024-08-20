import arrowLeft from '@tabler/icons/outline/arrow-left.svg?raw'
import arrowNarrowDown from '@tabler/icons/outline/arrow-narrow-down.svg?raw'
import arrowNarrowUp from '@tabler/icons/outline/arrow-narrow-up.svg?raw'
import arrowsMove from '@tabler/icons/outline/arrows-move.svg?raw'
import bold from '@tabler/icons/outline/bold.svg?raw'
import brandGithub from '@tabler/icons/outline/brand-github.svg?raw'
import chevronRight from '@tabler/icons/outline/chevron-right.svg?raw'
import eraser from '@tabler/icons/outline/eraser.svg?raw'
import eye from '@tabler/icons/outline/eye.svg?raw'
import eyeOff from '@tabler/icons/outline/eye-off.svg?raw'
import fileText from '@tabler/icons/outline/file-text.svg?raw'
import gripHorizontal from '@tabler/icons/outline/grip-horizontal.svg?raw'
import highlight from '@tabler/icons/outline/highlight.svg?raw'
import home from '@tabler/icons/outline/home.svg?raw'
import menu2 from '@tabler/icons/outline/menu-2.svg?raw'
import note from '@tabler/icons/outline/note.svg?raw'
import notebook from '@tabler/icons/outline/notebook.svg?raw'
import pencil from '@tabler/icons/outline/pencil.svg?raw'
import photoScan from '@tabler/icons/outline/photo-scan.svg?raw'
import playerPlay from '@tabler/icons/outline/player-play.svg?raw'
import plus from '@tabler/icons/outline/plus.svg?raw'
import send from '@tabler/icons/outline/send.svg?raw'
import settings from '@tabler/icons/outline/settings.svg?raw'
import sparkles from '@tabler/icons/outline/sparkles.svg?raw'
import underline from '@tabler/icons/outline/underline.svg?raw'
import user from '@tabler/icons/outline/user.svg?raw'
import x from '@tabler/icons/outline/x.svg?raw'

const icons = {
  arrowLeft,
  arrowNarrowDown,
  arrowNarrowUp,
  arrowsMove,
  bold,
  brandGithub,
  chevronRight,
  eraser,
  eye,
  eyeOff,
  fileText,
  gripHorizontal,
  highlight,
  home,
  menu2,
  note,
  notebook,
  pencil,
  photoScan,
  playerPlay,
  plus,
  send,
  settings,
  sparkles,
  underline,
  user,
  x,
} as const satisfies Record<string, string>

export const removeIconSize = (svg: string) =>
  svg.replace(/width="[0-9]+"/, '').replace(/height="[0-9]+"/, '')

export const icon = (name: keyof typeof icons) => removeIconSize(icons[name])
