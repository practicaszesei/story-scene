import { createRouter, createWebHistory } from "vue-router";
import Scene from "../views/Scene.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "scene",
      component: Scene,
      props: true,
    },
  ],
});

export default router;
