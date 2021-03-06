import Alert from './alert-native.js'
import Button from './button-native.js'
import Carousel from './carousel-native.js'
import Collapse from './collapse-native.js'
import Dropdown from './dropdown-native.js'
import Modal from './modal-native.js'
import Popover from './popover-native.js'
import ScrollSpy from './scrollspy-native.js'
import Tab from './tab-native.js'
import Toast from './toast-native.js'
import Tooltip from './tooltip-native.js'
import './util/init.js'
import {initCallback,removeDataAPI} from './util/callbacks.js'
import {componentsInit} from './util/globals.js'
import {Util} from './util/util.js'
import {version as Version} from './../package.json'

const components = {
  Alert,
  Button,
  Carousel,
  Collapse,
  Dropdown,
  Modal,
  Popover,
  ScrollSpy,
  Tab,
  Toast,
  Tooltip
}


export {
  components,
  initCallback,
  removeDataAPI,
  componentsInit,
  Util,
  Version
}