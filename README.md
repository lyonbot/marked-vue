# @lyonbot/marked-vue

[![npm version](https://img.shields.io/npm/v/@lyonbot/marked-vue.svg)](https://www.npmjs.com/package/@lyonbot/marked-vue)
[![License](https://img.shields.io/npm/l/@lyonbot/marked-vue.svg)](https://github.com/lyonbot/marked-vue/blob/main/LICENSE)
[![GitHub](https://img.shields.io/github/stars/lyonbot/marked-vue?style=social)](https://github.com/lyonbot/marked-vue)

Lightning-fast Markdown rendering in Vue with streaming superpowers! 🚀

A high-performance Vue 3 component that renders Markdown content with incremental updates, perfect for streaming applications and real-time content rendering.

## ✨ Features

- ⚡ **Lightning Fast** - Powered by [marked](https://github.com/markedjs/marked) and [Vue 3](https://vuejs.org/)
- 🔄 **Incremental Rendering** - Perfect for streaming content and real-time updates
- 🎨 **Customizable** - Use custom Vue components via scoped slots
- 🔌 **Extensible** - Support for Marked extensions and plugins

## 📦 Installation

```bash
pnpm install @lyonbot/marked-vue marked
```

## 🚀 Quick Start

```vue
<template>
  <MarkedVue :content="content" />
</template>

<script setup lang="ts">
import { MarkedVue } from "@lyonbot/marked-vue";
import { ref } from "vue";

const fullContent = `
# Hello World

Welcome to **marked-vue** - the fastest Markdown renderer for Vue!

## Features
- Incremental rendering
- Custom components
- Streaming support
`;

// Simulate streaming content
const content = ref("");
const timer = setInterval(() => {
  content.value = fullContent.slice(0, content.value.length + 5);
  if (content.value.length >= fullContent.length) clearInterval(timer);
}, 50);
</script>
```

## 🎨 Custom Components

Use scoped slots to customize how elements are rendered:

```xml
<MarkedVue :content="content">
  <!-- Custom code block renderer -->
  <template #code="{ token }">
    <pre class="my-code-block">
      <div class="my-code-block-lang" v-if="token.lang">
        {{ token.lang }}
      </div>
      <code>{{ token.text }}</code>
    </pre>
  </template>

  <!-- Custom list item renderer -->
  <template #list_item="{ token, content }">
    <li class="my-list-item">
      <component :is="content" />
    </li>
  </template>
</MarkedVue>
```

## ⚙️ Custom Marked Options

Pass `options` prop to customize [Marked options](https://marked.js.org/using_advanced#options):

```vue
<template>
  <MarkedVue :content="content" :options="markedOptions" />
</template>

<script setup lang="ts">
const markedOptions = {
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
};
</script>
```

## 🔌 Marked Extensions

Use the `setup` prop to integrate [Marked extensions](https://marked.js.org/using_pro#use):

⚠️ **Important**: If an extension introduces new token types, you must configure how to render them using scoped slots!

### Example: [marked-emoji](https://github.com/UziTech/marked-emoji) extension

```typescript
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

```xml
<MarkedVue :content="content" :setup="markedSetup">
  <!-- Render emoji tokens -->
  <template #emoji="{ token }: { token: EmojiToken<string> }">
    <span class="my-emoji">{{ token.emoji }}</span>
  </template>
</MarkedVue>
```

> **Note**: If you're not using TypeScript, you can remove the type annotation `: { token: EmojiToken<string> }`.

## 📚 API Reference

### Props

| Prop      | Type                       | Default     | Description                             |
| --------- | -------------------------- | ----------- | --------------------------------------- |
| `content` | `string`                   | `''`        | Markdown content to render              |
| `options` | `MarkedOptions`            | `{}`        | Marked parser options                   |
| `setup`   | `(marked: Marked) => void` | `undefined` | Function to configure Marked extensions |

### Scoped Slots

The component provides scoped slots for all Markdown elements. Common ones include:

- `#heading` - Headers (h1-h6)
- `#paragraph` - Paragraphs
- `#code` - Code blocks
- `#list` - Lists (ordered/unordered)
- `#list_item` - List items
- `#strong` - Bold text
- `#em` - Italic text
- `#link` - Links
- `#image` - Images
- and any other token type from [Marked built-in Tokens](https://github.com/markedjs/marked/blob/master/src/Tokens.ts) and your extensions

Each slot receives these props:

- `token` - Object of current token
  - `token.raw` - Raw text of current token
  - `token.*` - Any other property of current token
- `content` - Function to render children of current token
  - to render them, use `<component :is="content" />`
- `original` - Function to render original element of current token
  - to render it, use `<component :is="original" />`
