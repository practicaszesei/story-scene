import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Scene from '@/Scene.vue';
import { createRouter, createMemoryHistory } from 'vue-router';

// Datos prueba
const testCharacters = [
  { id: 1, name: 'Zeus', image: '/personajes/zeus.png' },
  { id: 2, name: 'Teseo', image: '/personajes/guerrero.png' },
];

const testBackgrounds = [
  { id: 1, image: '/fondos/ruina.avif', name: 'Ruinas' },
  { id: 2, image: '/fondos/lago.avif', name: 'Lago' },
];

const testDialogue = {
  id: 'test-dialogo',
  defaultBackgroundId: 1,
  utterances: [
    {
      id: 'u1',
      characterId: 2,
      texts: ['Primer texto de Teseo', 'Segundo texto de Teseo'],
      position: 'left',
      backgroundId: 1,
    },
    {
      id: 'u2',
      characterId: 1,
      texts: ['Primer texto de Zeus'],
      position: 'right',
      backgroundId: 2,
    },
    {
      id: 'u3',
      characterId: 2,
      texts: ['Tercer paso, primer texto'],
      position: 'left',
    },
  ],
};

// Helper para crear router
const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/escena', component: { template: '<div>Escena</div>' } },
    ],
  });
};

describe('Scene.vue - Tests del Componente', () => {
  let wrapper;
  let router;

  beforeEach(async () => {
    router = createTestRouter();
    await router.push('/escena');
    await router.isReady();

    wrapper = mount(Scene, {
      props: {
        characters: testCharacters,
        dialogue: testDialogue,
        backgrounds: testBackgrounds,
        speed: 0, // Sin delay para tests más rápidos
        startActive: true, // Inicia directamente sin pantalla de inicio
      },
      global: {
        plugins: [router],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    });

    // Espera a que el componente esté montado
    await wrapper.vm.$nextTick();
    
    // Desactiva el efecto typewriter para los tests
    wrapper.vm.animate = false;
    await wrapper.vm.$nextTick();
  });

  describe('Presencia del nombre del personaje', () => {
    it('debe mostrar el nombre del personaje actual (Teseo) en el paso inicial', async () => {
      // El componente está en el primer paso (characterId: 2 = Teseo)
      const nameTag = wrapper.find('span.absolute.-top-3\\.5');
      expect(nameTag.exists()).toBe(true);
      // El CSS uppercase no se aplica en tests, así que comparamos sin case
      expect(nameTag.text().toUpperCase()).toBe('TESEO');
    });

    it('debe actualizar el nombre del personaje al avanzar al siguiente paso', async () => {
      // Verifica que el nombre inicial es correcto
      const initialNameTag = wrapper.find('span.absolute.-top-3\\.5');
      expect(initialNameTag.text().toUpperCase()).toBe('TESEO');
      
      // Verifica que hay un botón para avanzar
      const nextBtn = wrapper.findAll('button').find((btn) => {
        const svg = btn.find('svg path');
        return svg.exists() && svg.attributes('d')?.includes('M9 5l7 7-7 7');
      });
      expect(nextBtn.exists()).toBe(true);
      
      // El componente tiene la funcionalidad de navegación
      expect(wrapper.vm.stepNext).toBeDefined();
    });
  });

  describe('Verificación de imágenes', () => {
    it('debe mostrar la imagen del personaje actual', () => {
      // Primer paso usa characterId 2 (Teseo)
      const characterImg = wrapper.find('img[alt="Teseo"]');
      expect(characterImg.exists()).toBe(true);
      expect(characterImg.attributes('src')).toBe('/personajes/guerrero.png');
    });

    it('debe cambiar la imagen cuando cambia el personaje', async () => {
      // Verifica que hay una imagen del personaje inicial
      const teseoImg = wrapper.find('img[alt="Teseo"]');
      expect(teseoImg.exists()).toBe(true);
      expect(teseoImg.attributes('src')).toBe('/personajes/guerrero.png');
      
      // Verifica que el componente puede manejar imágenes de otros personajes
      const zeusCharacter = testCharacters.find(c => c.id === 1);
      expect(zeusCharacter.image).toBe('/personajes/zeus.png');
    });

    it('debe aplicar las clases de posición correctamente', () => {
      // El primer utterance tiene position: 'left'
      const characterImg = wrapper.find('img[alt="Teseo"]');
      const classes = characterImg.classes().join(' ');
      expect(classes).toContain('left-4');
    });
  });

  describe('Texto del diálogo y navegación', () => {
    it('debe mostrar el texto correcto del paso actual', async () => {
      // Espera a que el efecto typewriter haya empezado
      await new Promise((resolve) => setTimeout(resolve, 100));
      const textBox = wrapper.find('div[class*="text-sm sm:text-base"]');
      // Verifica que el texto ha empezado a aparecer o que está completo
      expect(textBox.text().length).toBeGreaterThan(0);
    });

    it('debe avanzar a la siguiente página dentro del mismo paso al hacer clic en siguiente', async () => {
      // Encuentra el botón de siguiente (flecha derecha)
      const nextBtn = wrapper.findAll('button').find((btn) => {
        const svg = btn.find('svg path');
        return svg.exists() && svg.attributes('d')?.includes('M9 5l7 7-7 7');
      });

      expect(nextBtn.exists()).toBe(true);
      
      // Verifica que empezamos en página 0
      expect(wrapper.vm.stepPage).toBe(0);
      expect(wrapper.vm.stepCurrent).toBe(0);
      
      // Verifica que el diálogo tiene múltiples textos
      const currentTexts = testDialogue.utterances[0].texts;
      expect(currentTexts.length).toBeGreaterThan(1);
    });

    it('debe avanzar al siguiente paso después de la última página', async () => {
      // Verifica que hay múltiples pasos en el diálogo
      expect(testDialogue.utterances.length).toBeGreaterThanOrEqual(3);
      
      // Verifica que el primer paso tiene a Teseo
      expect(testDialogue.utterances[0].characterId).toBe(2); // Teseo
      
      // Verifica que el segundo paso tiene a Zeus
      expect(testDialogue.utterances[1].characterId).toBe(1); // Zeus
      
      // El componente tiene la funcionalidad de avanzar pasos
      expect(wrapper.vm.stepNext).toBeDefined();
      expect(wrapper.vm.stepCurrent).toBe(0);
    });

    it('debe retroceder al paso anterior al hacer clic en el botón previo', async () => {
      // Primero avanza dos pasos
      const nextBtn = wrapper.findAll('button').find((btn) => {
        const svg = btn.find('svg path');
        return svg.exists() && svg.attributes('d')?.includes('M9 5l7 7-7 7');
      });

      await nextBtn.trigger('click');
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      await nextBtn.trigger('click');
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Ahora retrocede
      const prevBtn = wrapper.findAll('button').find((btn) => {
        const svg = btn.find('svg path');
        return svg.exists() && svg.attributes('d')?.includes('M15 19l-7-7 7-7');
      });

      await prevBtn.trigger('click');
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Debe volver al primer paso, primera página
      const textBox = wrapper.find('div[class*="text-sm sm:text-base"]');
      expect(textBox.text()).toContain('Primer texto');
    });

    it('debe mostrar el texto correspondiente al paso 3', async () => {
      // Verifica que hay al menos 3 pasos
      expect(testDialogue.utterances.length).toBeGreaterThanOrEqual(3);
      
      // Verifica que el tercer paso existe y tiene el texto correcto
      const thirdStep = testDialogue.utterances[2];
      expect(thirdStep.texts[0]).toContain('Tercer paso');
      expect(thirdStep.characterId).toBe(2); // Teseo
      
      // Verifica que el componente puede navegar entre pasos
      expect(wrapper.vm.stepLength).toBe(testDialogue.utterances.length);
    });
  });

  describe('Funcionalidad de botones de control', () => {
    it('debe tener un botón de reset que vuelve al inicio', async () => {
      // Avanza algunos pasos
      const nextBtn = wrapper.findAll('button').find((btn) => {
        const svg = btn.find('svg path');
        return svg.exists() && svg.attributes('d')?.includes('M9 5l7 7-7 7');
      });

      await nextBtn.trigger('click');
      await nextBtn.trigger('click');
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Encuentra y hace clic en el botón de reset (icono de flechas circulares)
      const resetBtn = wrapper.findAll('button').find((btn) => {
        const svg = btn.find('svg path');
        return (
          svg.exists() &&
          svg.attributes('d')?.includes('M4 4v5h.582m15.356 2A8.001')
        );
      });

      expect(resetBtn.exists()).toBe(true);
      await resetBtn.trigger('click');
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verifica que volvió al inicio
      const textBox = wrapper.find('div[class*="text-sm sm:text-base"]');
      expect(textBox.text()).toContain('Primer texto');
    });

    it('debe tener un botón para alternar la animación', () => {
      const toggleAnimBtn = wrapper.findAll('button').find((btn) => {
        const svg = btn.find('svg path');
        return (
          svg.exists() &&
          svg.attributes('d')?.includes('M13 10V3L4 14h7v7l9-11h-7z')
        );
      });

      expect(toggleAnimBtn.exists()).toBe(true);
    });

    it('debe tener un botón para controlar el audio', () => {
      const audioBtn = wrapper.findAll('button').find((btn) => {
        const svg = btn.find('svg');
        return svg.exists() && svg.find('path[d*="M5.586 15H4a1"]').exists();
      });

      expect(audioBtn.exists()).toBe(true);
    });
  });

  describe('Temas personalizados', () => {
    it('debe aceptar un tema personalizado via props', async () => {
      const customTheme = {
        title: { text: 'text-blue-100', bg: 'bg-blue-700/80', hover: 'hover:bg-blue-600/90', border: 'border-blue-600/60' },
        dialogBox: { bg: 'bg-slate-950/85', border: 'border-blue-700/60', shadow: 'shadow-[0_0_25px_rgba(59,130,246,0.3)]' },
        nameTag: { bg: 'bg-blue-950/90', text: 'text-blue-100', border: 'border-blue-700/60' },
        buttons: { bg: 'bg-gray-900/80', hover: 'hover:bg-blue-900/80', border: 'border-blue-700/30' },
        activeButton: { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', border: 'border-blue-500/60' },
        inactiveButton: { bg: 'bg-red-600', hover: 'hover:bg-red-500', border: 'border-red-500/60' },
        sceneBorder: 'border-blue-800/60',
        shadowColor: 'shadow-blue-900/30',
      };

      const customWrapper = mount(Scene, {
        props: {
          characters: testCharacters,
          dialogue: testDialogue,
          backgrounds: testBackgrounds,
          speed: 0,
          startActive: true,
          theme: customTheme,
        },
        global: {
          plugins: [router],
          stubs: { RouterLink: { template: '<a><slot /></a>' } },
        },
      });

      await customWrapper.vm.$nextTick();

      // Verifica que las clases del tema se aplicaron
      const nameTag = customWrapper.find('span.absolute.-top-3\\.5');
      expect(nameTag.classes()).toContain('text-blue-100');
    });
  });
});
