<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let searchQuery = '';
	export let isLoading = false;
	export let error = '';
	export let usingFallbackData = false;

	const dispatch = createEventDispatcher<{
		search: string;
		clearCache: void;
	}>();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			dispatch('search', searchQuery);
		}
	}

	function handleSearch() {
		dispatch('search', searchQuery);
	}

	function handleClearCache() {
		dispatch('clearCache');
	}
</script>

<div class="mb-8 rounded-xl bg-white p-6 shadow-lg">
	<div class="mb-4 flex gap-4">
		<div class="flex-1">
			<input
				type="text"
				bind:value={searchQuery}
				on:keydown={handleKeydown}
				placeholder="Search for items, services, or materials..."
				class="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
			/>
		</div>
		<button
			on:click={handleSearch}
			disabled={isLoading || !searchQuery.trim()}
			class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{isLoading ? 'Searching...' : 'Search'}
		</button>
		<button
			on:click={handleClearCache}
			class="rounded-lg bg-gray-500 px-4 py-3 text-white transition-colors hover:bg-gray-600"
			title="Clear Cache"
		>
			🗑️
		</button>
	</div>

	{#if error}
		<div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
			{error}
		</div>
	{/if}

	{#if usingFallbackData && !error}
		<div class="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-700">
			API server is not available. Showing sample data for testing purposes.
			<br />
			Try searching for:
			<strong>paint, kitchen, flooring, electrical, plumbing, carpet, window</strong>
		</div>
	{/if}
</div>
