<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SearchResult } from '$lib/sampleData';

	export let searchResults: SearchResult[] = [];
	export let isLoading = false;
	export let searchQuery = '';
	export let usingFallbackData = false;

	const dispatch = createEventDispatcher<{
		addToEstimate: SearchResult;
		openDebug: number;
	}>();

	function handleAddToEstimate(item: SearchResult) {
		dispatch('addToEstimate', item);
	}

	function handleOpenDebug(index: number) {
		dispatch('openDebug', index);
	}
</script>

<div class="rounded-xl bg-white p-6 shadow-lg">
	<h2 class="mb-4 text-xl font-semibold text-gray-800">Search Results</h2>

	{#if isLoading}
		<div class="py-8 text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
			<p class="mt-2 text-gray-500">Searching...</p>
		</div>
	{:else if searchResults.length === 0}
		<div class="py-8 text-center text-gray-500">
			{searchQuery
				? usingFallbackData
					? 'No results found in sample data. Try: paint, kitchen, flooring, electrical, or plumbing.'
					: 'No results found. Try a different search term.'
				: 'Enter a search term to find items and services.'}
		</div>
	{:else}
		<div class="space-y-3">
			{#each searchResults as item, index}
				<div class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
					<div class="mb-2 flex items-start justify-between">
						<h3 class="flex-1 pr-2 font-medium text-gray-800">{item.name}</h3>
						<div class="flex items-center gap-2">
							<span class="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
								{item.category || 'General'}
							</span>
							<button
								on:click={() => handleOpenDebug(index)}
								class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200"
								title="Show raw JSON data"
							>
								🐛 Debug
							</button>
						</div>
					</div>
					{#if item.description}
						<p class="mb-3 line-clamp-2 text-sm text-gray-600">{item.description}</p>
					{/if}
					<div class="flex items-center justify-between">
						<span class="text-lg font-semibold text-green-600">
							${item.cost.toFixed(2)}{item.unit ? ` / ${item.unit}` : ''}
						</span>
						<button
							on:click={() => handleAddToEstimate(item)}
							class="rounded bg-green-600 px-3 py-1 text-sm text-white transition-colors hover:bg-green-700"
						>
							Add to Estimate
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
