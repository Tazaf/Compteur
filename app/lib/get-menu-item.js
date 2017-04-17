exports.byId = getItemById
exports.byLabel = getItemByLabel

/**
 * Gets a specific Menu Item from the specified Menu that matches the provided label.
 * @param {*} label The label of the Menu Item to retrieve
 * @param {*} menu The Menu from which the Menu Item is to be retrieved
 */
function getItemByLabel(label, menu) {

  return getItem(menu, matchLabel)

  function matchLabel(item) {
    return item.label.toString().toLowerCase() === label.toString().toLowerCase()
  }
}

/**
 * Gets a specific Menu Item from the specified Menu that matches the provided id.
 * @param {*} id The label of the Menu Item to retrieve
 * @param {*} menu The Menu from which the Menu Item is to be retrieved
 */
function getItemById(id, menu) {

  return getItem(menu, matchId)

  function matchId(item) {
    return item.id === id
  }
}

/**
 * 
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
