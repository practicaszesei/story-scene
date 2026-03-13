import { createRouter, createWebHistory } from 'vue-router'
import SceneView from '@/views/SceneView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Scene',
            component: SceneView,
        },
    ],
})

export default router
