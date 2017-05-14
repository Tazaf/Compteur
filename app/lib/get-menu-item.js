const path = require('path')
const electron = require('electron')
const Menu = electron.Menu
const StrConv = require(path.join(__dirname, 'string-convert.js'))
const Logger = require(path.join(__dirname, 'logger.js'))

const CacheMenuItems = {}
let AppMenu

exports.byId = getItemByIdFn
exports.byLabel = getItemByLabelFn
exports.switchFullScreen = switchFullScreenFn
exports.switchSpectatorView = switchSpectatorViewFn
exports.enableSpectatorViewItems = enableSpectatorViewItemsFn
Object.defineProperty(exports, 'spectatorViewOn', { get: () => getMenuItemFromCache('spectatorViewOn') });
Object.defineProperty(exports, 'spectatorViewOff', { get: () => getMenuItemFromCache('spectatorViewOff') });
Object.defineProperty(exports, 'verticalDisplay', { get: () => getMenuItemFromCache('verticalDisplay') });
Object.defineProperty(exports, 'horizontalDisplay', { get: () => getMenuItemFromCache('horizontalDisplay') });
Object.defineProperty(exports, 'addNewPlayer', { get: () => getMenuItemFromCache('addNewPlayer') });

/* ----- EXPORTED FUNCTIONS ----- */

/**
 * Gets a specific Menu Item from the specified Menu that matches the provided id.
 * @param {*} id The label of the Menu Item to retrieve
 * @param {*} menu The Menu from which the Menu Item is to be retrieved
 */
function getItemByIdFn(id, menu) {
  return getItem(menu, (item) => item.id === id)
}

/**
 * Gets a specific Menu Item from the specified Menu that matches the provided label.
 * @param {*} label The label of the Menu Item to retrieve
 * @param {*} menu The Menu from which the Menu Item is to be retrieved
 */
function getItemByLabelFn(label, menu) {
  return getItem(menu, (item) => item.label.toString().toLowerCase() === label.toString().toLowerCase())
}

/**
 * Switch the Spectator View Full Screen Menu items so that they reflect the current state of the window.
 * Passing true means that the FullScreen is on, while passing false means it's off.
 * @param {Boolean} state The state of the Spectator View Full Screen 
 */
function switchFullScreenFn(state) {
  getMenuItemFromCache('fullScreenOn').visible = !state
  getMenuItemFromCache('fullScreenOff').visible = !!state
}

/**
 * Switch the Spectator View Menu items so that they reflect the current state of the window.
 * Passing true means that the Spectator View is visible, while passing false means it's hidden.
 * @param {Boolean} state The state of the Spectator View
 */
function switchSpectatorViewFn(state) {
  getMenuItemFromCache('spectatorViewOn').visible = !state
  getMenuItemFromCache('spectatorViewOff').visible = !!state
}

/**
 * Enables or disables Spectator View related Menu Items, depending of the state value.
 * The affected menu items are:
 * * Full Screen
 * * Display Type
 * * Player Sort
 * @param {Boolean} state The state of the Spectator View Menu Items 
 */
function enableSpectatorViewItemsFn(state) {
  getMenuItemFromCache('display').enabled = state
  getMenuItemFromCache('fullScreenOn').enabled = state
  getMenuItemFromCache('fullScreenOff').enabled = state
  // getMenuItemFromCache('playerSort').enabled = state
}

/* ----- PRIVATE FUNCTIONS ----- */

/**
 * Get an Item from the given menu, provided that it respects the condition in the given matchFunction
 * @param {*} menu The Menu from which the Menu Item should be retrieved
 * @param {*} matchFunction A filter function that takes each item and returns it only if it matches a specific criteria
 */
function getItem(menu, matchFunction) {
  for (i in menu.items) {
    if (menu.items[i].submenu) {
      let menuItem = getItem(menu.items[i].submenu, matchFunction)
      if (menuItem) return menuItem
    }
    let menuItem = menu.items.find(matchFunction)
    if (menuItem) return menuItem
  }
  return false
}

/**
 * Gets a specific from the cache, based on the given itemName.
 * If the desired item is not in the cache, it will be retrieved from the app menu and cached.
 * For that, the given itemName will be converted to dash notation and be used a the menu item's id.
 * @param {*} itemName The name of the item in the cache object. Should be in camelCase format.
 */
function getMenuItemFromCache(itemName) {
  Logger.log('GetMenuItem:getMenuItemFromCache', itemName)
  if (!CacheMenuItems.hasOwnProperty(itemName)) {
    CacheMenuItems[itemName] = getItemByIdFn(StrConv.camelCaseToDash(itemName), getAppMenu())
  }
  return CacheMenuItems[itemName]
}

/**
 * Returns an object representing the Application Menu
 * This should be used instead of the AppMenu variable
 */
function getAppMenu() {
  if (!AppMenu) AppMenu = Menu.getApplicationMenu()
  return AppMenu
}
