import { unescape as heUnescape } from "he";
import type { MarkedToken, Token, Tokens } from "marked";
import { Comment, h, type VNodeArrayChildren, type VNodeChild } from "vue";

/**
 * (internal)
 * 
 * for `VNodeFactory` functions - if a token has no children, the factory will get this symbol as 2nd argument
 */
export const ChildrenNotAvaliable = Symbol('ChildrenNotAvaliable')

type PickByType<Token, Type> = Token extends { type: Type } ? Token : never
export type VNodeFactoryFn<Token> = (
  token: Token,
  children: Token extends { tokens?: any } ? VNodeArrayChildren : typeof ChildrenNotAvaliable,
  ctx: VueMarkedRenderer
) => VNodeChild

export type VNodeFactory = {
  [Type in MarkedToken['type']]: VNodeFactoryFn<PickByType<MarkedToken, Type>>
} & {
  // extended unstandardized Tokens that has no "type"
  checkbox: VNodeFactoryFn<Tokens.Checkbox>
}

function unescape<T>(text: T): T {
  if (typeof text !== 'string') return text
  return heUnescape(text) as T
}

export const getDefaultVNodeFactory: () => VNodeFactory = () => ({
  space: () => ' ',
  def: () => null,
  escape: () => null,

  code(token) {
    const props: any = {}
    if (token.lang) {
      props.class = `language-${token.lang}`
      props['data-lang'] = token.lang
    }
    return h('pre', props, h('code', [unescape(token.text)]))
  },

  blockquote(token, children) {
    return h('blockquote', null, children)
  },

  html(token) {
    // TODO: not supported yet?
    return h(Comment, null, token.text)
  },

  heading(token, children) {
    return h(`h${token.depth}`, null, children)
  },

  hr() {
    return h('hr')
  },

  list(token, _, ctx) {
    const type = token.ordered ? 'ol' : 'ul'
    let props: any = null
    if (token.ordered && token.start !== 1) props = { start: token.start }

    return h(type, props, token.items.map(item => ctx.render(item)))
  },

  list_item(token, itemChildren, ctx) {
    let children: VNodeArrayChildren = [...itemChildren]
    let props: any = {}

    if (token.task) {
      children.unshift(ctx.factory.checkbox({ checked: !!token.checked }, ChildrenNotAvaliable, ctx))
    }

    if (token.loose) children = [h('p', null, children)]
    return h('li', props, children)
  },

  checkbox(token) {
    return h('input', {
      type: 'checkbox',
      checked: !!token.checked,
      disabled: true,
    })
  },

  paragraph(token, children) {
    return h('p', null, children)
  },

  table(token, children, ctx) {
    function renderCell(type: 'td' | 'th', cell: Tokens.TableCell) {
      let props: any = null
      if (cell.align) props = { align: cell.align }
      return h(type, props, [ctx.render(cell.tokens)])
    }

    return h('table', null, [
      h('thead', null, [
        h('tr', null, token.header.map(cell => renderCell('th', cell))),
      ]),
      token.rows.length > 0 ?
        h('tbody', null, token.rows.map(row =>
          h('tr', null, row.map(cell => renderCell('td', cell))))) :
        null,
    ])
  },

  // span level
  strong: (token, children) => h('strong', null, children),
  em: (token, children) => h('em', null, children),
  codespan: (token) => h('code', null, token.text),
  br: () => h('br'),
  del: (token, children) => h('del', null, children),
  link: (token, children) => h('a', { href: token.href, title: token.title }, children),
  image: (token, _children) => h('img', { src: token.href, alt: token.text, title: token.title }),
  text: (token, children) => ((children as any) === ChildrenNotAvaliable) ? unescape(token.text) : children,
})

/**
 * Convert Marked tokens to Vue nodes
 * 
 * - Use `render(tokens)` to render tokens to Vue VNodeChild (one or more VNodes, or just string)
 * - Converting rules are defined in `factory` object.
 */
export class VueMarkedRenderer {
  factory: VNodeFactory = getDefaultVNodeFactory()

  /**
   * render tokens to Vue VNodeChild (one or more VNodes, or just string)
   */
  render(tokens: Token[] | Token | null | undefined): VNodeChild {
    if (!tokens || typeof tokens !== 'object') return null

    const renderToken = (token: Token): VNodeChild => {
      const type = token.type as keyof VNodeFactory
      const children = ('tokens' in token && Array.isArray(token.tokens)) && this.render(token.tokens)

      if (type in this.factory) {
        const c = Array.isArray(children) ? children as VNodeArrayChildren : children ? [children] : ChildrenNotAvaliable
        return this.factory[type](token as any, c as any, this)
      }

      return children || null
    }

    if (Array.isArray(tokens)) return tokens.map(token => renderToken(token))
    return renderToken(tokens)
  }
}
