// https://github.com/cheft/minrouter
class Router {
  constructor (resMethods = {}, name = 'ROUTER') {
    // 路由
    this.isRouter = true
    this.routes = []
    // 渲染方法
    this.resMethods = resMethods
    // 是否初次访问页面
    this.isOrigin = true
    this.req = {}
    this.res ={}
    //离开页面后调用的函数
    this.routerLeft = function() {}
    this.regexps = [
      /[\-{}\[\]+?.,\\\^$|#\s]/g,
      /\((.*?)\)/g,
      /(\(\?)?:\w+/g,
      /\*\w+/g,
    ]
    this.name = name
    window.ROUTER_NAME = name
    window[name] = this
  }
  get(path, fn) {
    this.routes.push({ path: path, fn: fn })
  }
  needBrowserRender(callback) {
    if (this.isOrigin) {
      this.runPage(callback)
      this.isOrigin = false
      return false
    }
    return true
  }
  runPage(callback) {
    if(typeof callback === 'function') {
      let routerLeft
      try {
        routerLeft = callback()
      } catch(e) {
        console.log(e)
      }
      if(typeof routerLeft === 'function') {
        this.routerLeft = routerLeft
      }
    }
  }
  start() {
    window.addEventListener('popstate', this.emit, false)
    for (let m in this.resMethods) {
      this.res[m] = this.resMethods[m].bind(this)
    }
    this.emit()
  }
  emit() {
    let router = this.isRouter ? this : window[ROUTER_NAME]
    if (router.req.url === location.href) return
    router.req.url = location.href
    router.req.path = location.pathname
    router.req.query = router.extractQuery()
    router.routerLeft = function () {}
    router.exec()
  }
  extractQuery() {
    let url = location.search
    const pattern = /(\w+)=([^\?|^\&]+)/ig
    let query = {}
    url.replace(pattern, function(a, b, c) {
      query[b] = c;
    })
    return query;
  }
  exec() {
    for (let i = 0; i < this.routes.length; i++) {
      let route = this.extractRoute(this.routes[i].path);
      if (!route.regexp.test(this.req.path)) {
        continue
      }
      let results = this.extractParams(route.regexp, this.req.path)
      this.req.params = this.req.params || {}
      for (let j = 0; j < route.matchs.length; j++) {
        this.req.params[route.matchs[j]] = results[j]
      }
      this.routes[i].fn.call(this, this.req, this.res, this.next)
    }
  }
  extractRoute(route) {
    let matchs = []
    const regexps = this.regexps
    route = route.replace(regexps[0], '\\$&')
      .replace(regexps[1], '(?:$1)?')
      .replace(regexps[2], function (match, optional) {
        if (match) matchs.push(match.replace(':', ''))
        return optional ? match : '([^/?]+)'
      }).replace(regexps[3], function (match, optional) {
        if (match) matchs.push(match.replace('*', ''))
        return '([^?]*?)'
      })
    return {
      regexp: new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$'),
      matchs: matchs
    }
  }
  extractParams (route, path) {
    const params = route.exec(path).slice(1)
    let results = []
    for (let i = 0; i < params.length; i++) {
      results.push(decodeURIComponent(params[i]) || null)
    }
    return results
  }
  go(path, isReplace, lastPath) {
    this.routerLeft()
    if (lastPath) {
      history.pushState({ path: lastPath }, null, lastPath);
    }
    if (isReplace)  {
      history.replaceState({ path: path }, null, path);
    } else {
      history.pushState({ path: path }, null, path);
    }
    this.emit()
  }
}


module.exports = Router
