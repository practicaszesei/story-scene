import { createRouter, createWebHistory } from 'vue-router';
import Scene from './Scene.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Scene },
  { path: '/escena', component: Scene },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
