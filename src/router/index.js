import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

Vue.use(Router)

const is = (type) => (new RegExp('www|api|hive|localhost:8080|localhost:5000')).test(window.location.host.split('.')[0]) === (type !== 'back')

const load = name => resolve => require(['%/' + (is('front') ? 'front/' : 'back/') + (name || 'index')], resolve)
const error = [{
  path: '*',
  component: load('Error'),
  props: {
    code: '404'
  }
}]

const frontRoutes = [
  {
    path: '/',
    component: load(),
    children: [
      { path: '', name: 'home', component: load('Home'), meta: { back: { auth: true } } },
      { path: 'signin', name: 'signin', component: load('Signin'), meta: { back: { auth: false } } },
      { path: 'logout', name: 'logout', component: load('Logout'), meta: { back: { auth: true } } }
    ]
  },
  ...error
]

const backRoutes = [
  {
    path: '/',
    component: load(),
    children: [
      {
        path: '',
        component: load('Dash'),
        meta: { back: { auth: true } },
        children: [
          { path: '', name: 'dash-home', component: load('Dash/Home'), meta: { back: { auth: true } } },
          { path: 'users', name: 'dash-users', component: load('Dash/Users'), meta: { back: { auth: true } } },
          { path: 'fleet', name: 'dash-fleet', component: load('Dash/Fleet'), meta: { back: { auth: true } } },
          { path: 'stops', name: 'dash-stops', component: load('Dash/Stops'), meta: { back: { auth: true } } },
          { path: 'orders', name: 'dash-orders', component: load('Dash/Orders'), meta: { back: { auth: true } } },
          { path: 'products', name: 'dash-products', component: load('Dash/Products'), meta: { back: { auth: true } } },
          { path: 'directions', name: 'dash-directions', component: load('Dash/Directions'), meta: { back: { auth: true } } },
          { path: 'map', name: 'dash-map', component: load('Dash/Map'), meta: { back: { auth: true } } }
        ]
      },
      { path: 'signin', name: 'signin', component: load('Signin'), meta: { back: { auth: false } } },
      { path: 'logout', name: 'logout', component: load('Logout'), meta: { back: { auth: true } } }
    ]
  },
  ...error
]

const router = new Router({
  routes: is('back') ? backRoutes : frontRoutes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(r => r.meta.back && r.meta.back.auth) && is('back')) {
    if (!store.getters.isUserLoggedIn) {
      next({
        name: 'signin',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else if (to.matched.some(r => r.meta.back && !r.meta.back.auth) && is('back')) {
    if (store.getters.isUserLoggedIn) {
      next({
        name: 'dash-home'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
