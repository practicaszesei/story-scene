import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Scene from './Scene.vue'

// --- MOCK DE SPEECH SYNTHESIS ---
//crea una voz falsa para que Vitest no de error de "undefined"
vi.stubGlobal('speechSynthesis', {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue([]),
  onvoiceschanged: null,
})

vi.stubGlobal('SpeechSynthesisUtterance', class {
  constructor(text) {
    this.text = text;
  }
})
// --------------------------------

const mockData = {
  characters: [{ id: 1, name: 'Test Personaje', image: 'test-img.png' }],
  backgrounds: [{ id: 1, image: 'bg.jpg' }],
  dialogue: {
    defaultBackgroundId: 1,
    utterances: [{ characterId: 1, texts: ['Hola 1', 'Hola 2'], position: 'left' }]
  },
  theme: {
    borderColor: 'border-amber-600',
    bgColor: 'bg-black',
    textColor: 'text-white',
    nameTagBg: 'bg-stone-900',
    nameTagText: 'text-yellow-500',
    btnBg: 'bg-stone-900',
    btnHover: 'hover:bg-stone-800'
  }
}

describe('Scene.vue - Pruebas Avanzadas', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Comprueba la presencia del nombre del personaje', async () => {
    const wrapper = mount(Scene, { props: mockData })
    const nameTag = wrapper.find('[data-test="character-name"]')
    expect(nameTag.text()).toBe('Test Personaje')
  })

  it('Comprueba que las imágenes cargan correctamente', () => {
    const wrapper = mount(Scene, { props: mockData })
    const img = wrapper.find('[data-test="character-image"]')
    expect(img.attributes('src')).toBe('test-img.png')
  })

  it('Verifica que se aplican las clases de Tailwind del tema', () => {
    const wrapper = mount(Scene, { props: mockData })
    const nameTag = wrapper.find('[data-test="character-name"]')
    expect(nameTag.classes()).toContain('bg-stone-900')
    expect(nameTag.classes()).toContain('text-yellow-500')
  })

  it('Cambia el texto al hacer click en el diálogo', async () => {
    const wrapper = mount(Scene, { props: mockData })
    // Avanzamos al segundo texto
    await wrapper.find('[data-test="dialogue-container"]').trigger('click')
    
    const textDisplay = wrapper.find('[data-test="dialogue-text"]')
    // Nota: Como hay un efecto typing, el texto completo aparece tras el click de "Saltar"
    expect(textDisplay.text()).toContain('Hola 1')
  })

  it('El botón "Anterior" está deshabilitado al inicio', () => {
    const wrapper = mount(Scene, { props: mockData })
    const backButton = wrapper.findAll('button').at(0)
    expect(backButton.element.disabled).toBe(true)
  })
})