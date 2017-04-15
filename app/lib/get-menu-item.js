module.exports = function getItem(id, menu) {
  for (i in menu.items) {
    if (menu.items[i].submenu && menu.items[i].submenu.items) {
      var subItem = menu.items[i].submenu.items.find((item) => {
        return item.id === id
      })

      if (subItem) {
        return subItem
      } else {
        var menuItem = menu.items.find((item) => {
          return item.id === id
        })

        if (menuItem) {
          return menuItem
        }
      }

    } else {
      var menuItem = menu.items.find((item) => {
        return item.id === id
      })

      if (menuItem) {
        return menuItem
      }
    }
  }
  return false
}
