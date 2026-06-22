<script lang="ts">
  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b">
    <div class="max-w-5xl mx-auto px-4 py-3 font-semibold">Dashboard Admin</div>
  </header>
  <main class="flex-1">{@render children()}</main>
</div>
