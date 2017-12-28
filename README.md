#### m-router

[![npm](https://img.shields.io/npm/dt/m-router.svg)]()
[![GitHub issues](https://img.shields.io/github/issues/hpoenixf/m-router.svg)](https://github.com/hpoenixf/koa2-proxies/issues)
[![GitHub license](https://img.shields.io/github/license/hpoenixf/m-router.svg)](https://github.com/hpoenixf/koa2-proxies/blob/master/LICENSE)


#### example

```javascript

// router.js
import Router  from 'm-router'
import Xtemplate from 'xtemplate/lib/runtime'
import controller from 'controller'

let router = new Router({
  render(xtpl, data, callback) {
    document.getElementById('root').innerHTML = new Xtemplate(xtpl).render(data)
    this.runPage(callback)
    $('body').scrollTop(0) // to top
  }
})


router.get('/url/a', controller.a)
router.get('/url/b', controller.b)


router.start()


// controller.js

// webpack Dynamic Imports https://webpack.js.org/guides/code-splitting/#dynamic-imports

export default {
    a: function(req, res) {
      import(/* webpackChunkName: "a" */ 'script/a').then(module => {
        if (this.needBrowserRender(module.default)) {
          res.render(
            require('views/a.xtpl'),
            {
              title: 'a'
            },
            module.default)
        }
      })
    },
      b: function(req, res) {
        import(/* webpackChunkName: "b" */ 'script/b').then(module => {
          if (this.needBrowserRender(module.default)) {
            res.render(
              require('views/b.xtpl'),
              {
                title: 'b'
              },
              module.default)
          }
        })
      },
}

// a.js

export default function() {
  console.log('page load')
  return function() {
    console.log('page left')
  }
}

```javascript