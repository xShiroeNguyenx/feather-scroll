import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import { Carousel, type Options } from '@feather-scroll/core';

/**
 * Vue 3 component (render-function based, no SFC compiler needed).
 *   <FeatherScroll :options="{ effect, loop: true }" v-model="index">
 *     <div v-for="s in slides">...</div>
 *   </FeatherScroll>
 */
export const FeatherScroll = defineComponent({
  name: 'FeatherScroll',
  props: {
    options: { type: Object as PropType<Options>, default: () => ({}) },
    modelValue: { type: Number, default: undefined },
  },
  emits: ['update:modelValue', 'change', 'ready'],
  setup(props, { slots, emit, expose }) {
    const el = ref<HTMLElement | null>(null);
    let instance: Carousel | null = null;

    onMounted(() => {
      if (!el.value) return;
      instance = new Carousel(el.value, props.options);
      instance.on('change', (p) => {
        emit('update:modelValue', p.index);
        emit('change', p.index);
      });
      emit('ready', instance);
    });

    watch(
      () => props.modelValue,
      (v) => {
        if (typeof v === 'number' && instance && v !== instance.index) instance.to(v);
      },
    );

    onBeforeUnmount(() => instance?.destroy());
    expose({ carousel: () => instance });

    return () => h('div', { ref: el }, slots.default ? slots.default() : []);
  },
});
