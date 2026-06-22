<script lang="ts">
  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b">
    <nav class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="/" class="font-semibold">Fotang Daxin</a>
      <div class="flex gap-4 text-sm">
        <a href="/">Beranda</a>
        <a href="/admin">Admin</a>
      </div>
    </nav>
  </header>
  <main class="flex-1">{@render children()}</main>
</div>
