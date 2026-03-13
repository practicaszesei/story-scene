import { test, expect } from "vitest"
import { render } from "vitest-browser-vue"
import { userEvent } from "vitest/browser"

import Scene from "../../src/views/Scene.vue"

const characters = [
  { id: 1, name: "King of Hearts", image: "/test.png" },
  { id: 2, name: "White Rabbit", image: "/test.png" }
]

const backgrounds = [
  { id: 1, image: "/bg.png" }
]

const dialogues = [
  {
    id: "d1",
    defaultBackgroundId: 1,
    utterances: [
      {
        id: "u1",
        characterId: 1,
        texts: ["Hola aventurero"],
        position: "left"
      },
      {
        id: "u2",
        characterId: 2,
        texts: ["Bienvenido al reino"],
        position: "right"
      }
    ]
  }
]

test("muestra el nombre del personaje", async () => {

  const screen = render(Scene, {
    props: { characters, backgrounds, dialogues }
  })

  await expect.element(
    screen.getByText("King of Hearts")
  ).toBeInTheDocument()

})

test("renderiza la imagen del personaje", async () => {

  const screen = render(Scene, {
    props: { characters, backgrounds, dialogues }
  })

  const img = screen.getByRole("img")

  await expect.element(img).toBeInTheDocument()

})

test("cambia el texto al hacer click en siguiente", async () => {

  const screen = render(Scene, {
    props: { characters, backgrounds, dialogues }
  })

  await expect.element(
    screen.getByText("Hola aventurero")
  ).toBeInTheDocument()

  const nextButton = screen.getByText("Siguiente")

  await userEvent.click(nextButton)

  await expect.element(
    screen.getByText("Bienvenido al reino")
  ).toBeInTheDocument()

})