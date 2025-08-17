import { Marked, type MarkedOptions } from 'marked'
import { defineComponent, h, shallowRef, useSlots, watch, watchEffect, watchSyncEffect, type PropType, type SlotsType, type VNode, type VNodeChild } from "vue";
import { VueMarkedRenderer, type VNodeFactory } from './renderer';

export default defineComponent({
  name: "MarkedVue",
  props: {
    content: {
      type: String,
      required: true,
    },
    options: {
      type: Object as PropType<MarkedOptions>,
      default: null,
    },
    setup: {
      type: Function as PropType<(marked: Marked) => void>,
      default: undefined,
    },
  },
  slots: Object as SlotsType<{
    [K in keyof VNodeFactory]: {
      token: Parameters<VNodeFactory[K]>[0]
      content: () => VNode[]
    }
  } & Record<string, { token: any, content: () => VNode[] }>>,
  setup(props) {
    const renderedVnode = shallowRef<VNodeChild | null>(null);
    const currentMarked = shallowRef<Marked>(null as unknown as Marked)
    const slots = useSlots()

    watchEffect(() => {
      const marked = new Marked();
      if (typeof props.options === 'object') marked.setOptions(props.options)
      if (typeof props.setup === 'function') props.setup(marked)
      currentMarked.value = marked
    })

    let renderer!: VueMarkedRenderer
    watchSyncEffect(() => {
      renderer = new VueMarkedRenderer()
      for (const id of Object.keys(slots)) {
        const slot = slots[id]
        if (!slot) continue

        renderer.factory[id as keyof VNodeFactory] = (token, ...args) => {
          return slot({
            token,
            content: (): VNode[] => {
              // Note: originalFactoryFn can be undefined, if user has custom Marked plugin and syntax
              const originalFactoryFn = renderer.factory[id as keyof VNodeFactory] as any
              const children = originalFactoryFn?.(token, ...args)?.children

              if (!children) return []
              if (typeof children === 'string') return [h('span', children)]
              if (Array.isArray(children)) return children
              return [children]
            }
          })
        }
      }
    })

    function update() {
      try {
        let fixedContent = props.content

        // make less glitch by auto fixing unfinished links
        const lastLine = fixedContent.slice(fixedContent.lastIndexOf('\n') + 1)
        const mat = lastLine.includes('[') && /\]\(([^)\s]*)$/.exec(lastLine)
        if (mat) {
          fixedContent = fixedContent.slice(0, -mat[0].length + 1) + '…'
        }

        const marked = currentMarked.value
        const parsed = marked.lexer(fixedContent)
        const vnodes = renderer.render(parsed)
        renderedVnode.value = vnodes
      } catch (err) {
        console.error(err)
        renderedVnode.value = null
      }
    }

    watch([() => props.content, currentMarked], update, { immediate: true, flush: 'post' })
    return { renderedVnode }
  },
  render() {
    return this.renderedVnode;
  },
});
