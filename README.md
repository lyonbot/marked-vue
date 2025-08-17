# @lyonbot/marked-vue

Lightning-fast Markdown rendering in Vue with streaming superpowers!

- Powered by [marked](https://github.com/markedjs/marked) and [Vue 3](https://vuejs.org/)
- Incremental render - good for streaming
- Use custom Vue components
- Use Marked extensions

## Usage

```sh
pnpm install @lyonbot/marked-vue marked
```

```html
<template>
  <MarkedVue :content="content" />
</template>

<script setup lang="ts">
  import { MarkedVue } from "@lyonbot/marked-vue";
  import { ref } from "vue";

  const fullContent = `
# Hello World

Efficient Markdown rendering in Vue. With incrementally update power!
`;

  // emulate streaming
  const content = ref("");
  const timer = setInterval(() => {
    content.value = fullContent.slice(0, content.value.length + 5);
    if (content.value.length >= fullContent.length) clearInterval(timer);
  }, 50);
</script>
```

### Custom Compoents

Use scoped slots to customize how elements shall render:

```html
<MarkedVue :content="content">
  <!-- custom code block renderer -->
  <template #code="{ token }">
    <pre class="my-code-block">
      <div class="my-code-block-lang" v-if="token.lang">
        {{ token.lang }}
      </div>
      <code>{{ token.text }}</code>
    </pre>
  </template>

  <!-- custom list item renderer -->
  <template #list_item="{ token, content }">
    <li class="my-list-item">
      <!-- render list item content -->
      <component :is="content" />
    </li>
  </template>
</MarkedVue>
```

### Custom Marked Options

You can pass `options` prop to customize [Marked options](https://marked.js.org/using_advanced#options)

```jsx
<MarkedVue :content="content" :options="markedOptions" />

const markedOptions = {
  gfm: true,
  breaks: true,
}
```

### Use Marked Extensions

You can pass `setup` prop to [use Marked extensions](https://marked.js.org/using_pro#use)

⚠️ If the extension introduces new Token type, you must configure how to render it in scoped slots!

Example: use [marked-emoji](https://github.com/UziTech/marked-emoji) extension

```ts
import { type Marked } from "marked";
import { markedEmoji, type EmojiToken } from "marked-emoji";
import { MarkedVue } from "@lyonbot/marked-vue";

const content = ref("Now I feel :heart: and :tada:");

const markedSetup = (marked: Marked) => {
  marked.use(
    markedEmoji({
      emojis: {
        heart: "❤️",
        tada: "🎉",
      },
    })
  );
};
```

```html
<MarkedVue :content="content" :setup="markedSetup">
  <!-- render emoji token -->
  <template #emoji="{ token }: { token: EmojiToken<string> }">
    <span class="my-emoji">{{ token.emoji }}</span>
  </template>
</MarkedVue>
```

Note: if not using TypeScript, you can delete the `: { token: EmojiToken<string> }` part
