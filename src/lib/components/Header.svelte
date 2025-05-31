<script lang="ts">
	export let usingFallbackData = false;
</script>

<div class="mb-8 text-center">
	<h1 class="mb-2 text-4xl font-bold text-gray-800">Cost Estimate Calculator</h1>
	<p class="text-gray-600">Search for items and services to build your cost estimate</p>
	{#if usingFallbackData}
		<div class="mt-2 inline-block rounded-lg bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
			Using sample data (API unavailable)
		</div>
	{/if}
</div>
