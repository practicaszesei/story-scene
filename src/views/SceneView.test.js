import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'
import SceneView from './SceneView.vue'

const characters = [
    {
        id: 1,
        name: "Ren Amamiya",
        image: "/img/Ren_Amamiya.webp"
    },
    {
        id: 2,
        name: "Futaba Sakura",
        image: "/img/Futaba_Sakura.webp"
    }
]

const backgrounds = [
    {
        id: 1,
        image: "/img/rooftop-persona3.png",
        name: "Rooftop"
    },
    {
        id: 2,
        image: "/img/persona-4-revival-872675.3.webp",
        name: "Classroom"
    }
]

const themes = [
    {
        id: 1,
        borderColor: "#760000",
        textColor: "#ff3232",
        backgroundColor: "#ffa5a5"
    },
    {
        id: 2,
        borderColor: "#6d8b00",
        textColor: "#94b227",
        backgroundColor: "#e7ff90"
    }
]

const utterance = [
    {
        characterId: 1,
        texts: ["Esto es la frase generica 1", "Siguiente frase generica"],
        position: "right-0",
        backgroundId: 1,
        themeId: 1
    },
    {
        characterId: 2,
        texts: ["Esto es la frase generica 2"],
        position: "left-0",
        backgroundId: 2,
        themeId: 2
    },
    {
        characterId: 1,
        texts: ["Esto es la frase generica 3"],
        position: "right-0",
        backgroundId: 1,
        themeId: 1
    }
]

const defaultProps = { characters, backgrounds, themes, utterance }

test('first character name presence', async () => {
    const { getByText } = render(SceneView, { 
        props: defaultProps 
    })

    await expect.element(getByText('Ren Amamiya')).toBeInTheDocument()
})

test('second character name presence', async () => {
    const { getByText } = render(SceneView, { 
        props: defaultProps 
    })

    await getByText('Siguiente').click()
    await getByText('Siguiente').click()

    await expect.element(getByText('Futaba Sakura')).toBeInTheDocument()
})

test('shows character image', async () => {
    const { getByRole } = render(SceneView, { props: defaultProps })

    await expect.element(getByRole('img')).toBeInTheDocument()
})


test('shows first dialogue text', async () => {
    const { getByText } = render(SceneView, { props: defaultProps })

    await expect.element(getByText('Esto es la frase generica 1')).toBeInTheDocument()
})

test('shows second text of the first character', async () => {
    const { getByText } = render(SceneView, { props: defaultProps })

    await getByText('Siguiente').click()

    await expect.element(getByText('Siguiente frase generica')).toBeInTheDocument()
})

test('shows second character dialogue', async () => {
    const { getByText } = render(SceneView, { props: defaultProps })

    await getByText('Siguiente').click()
    await getByText('Siguiente').click()

    await expect.element(getByText('Esto es la frase generica 2')).toBeInTheDocument()
})

test('goes back to the previous dialogue', async () => {
    const { getByText } = render(SceneView, { props: defaultProps })

    await getByText('Siguiente').click()
    await getByText('Siguiente').click()
    await getByText('Anterior').click()

    await expect.element(getByText('Siguiente frase generica')).toBeInTheDocument()
})