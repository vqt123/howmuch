<script lang="ts">
	import { onMount } from 'svelte';
	import { searchSampleData, type SearchResult } from '$lib/sampleData';

	let searchQuery = '';
	let searchResults: SearchResult[] = [];
	let selectedItems: (SearchResult & { quantity: number })[] = [];
	let isLoading = false;
	let error = '';
	let totalCost = 0;
	let usingFallbackData = false;
	let debugModalOpen = false;
	let debugData: any = null;
	let rawApiResults: any[] = [];

	// Calculate total cost whenever selectedItems changes
	$: totalCost = selectedItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);

	async function searchItems() {
		if (!searchQuery.trim()) return;

		isLoading = true;
		error = '';
		usingFallbackData = false;
		rawApiResults = [];

		try {
			const response = await fetch(
				`http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}`
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.success && data.data && data.data.results) {
				// Store raw API results for debugging
				rawApiResults = data.data.results;

				// Transform API results to match our interface
				searchResults = data.data.results.map((item: any) => ({
					id: item.id,
					name: item.title,
					description: item.description,
					cost: item.cost?.adjusted?.low || item.cost?.original?.low || 0,
					category: item.category || 'General',
					unit: item.cost?.adjusted?.unit || item.cost?.original?.unit || 'project'
				}));
			} else {
				throw new Error('Invalid response format');
			}
		} catch (err) {
			console.warn('API unavailable, using sample data:', err);
			// Fallback to sample data when API is unavailable
			searchResults = searchSampleData(searchQuery);
			usingFallbackData = true;
			if (searchResults.length === 0) {
				error =
					'No results found in sample data. Try searching for: paint, kitchen, flooring, electrical, or plumbing.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function clearCache() {
		try {
			const response = await fetch('http://localhost:3001/api/clear-cache', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					console.log('Cache cleared successfully');
					// Optionally show a success notification
				}
			}
		} catch (err) {
			console.error('Failed to clear cache (API may be unavailable):', err);
		}
	}

	function addToEstimate(item: SearchResult) {
		const existingItem = selectedItems.find((selected) => selected.id === item.id);

		if (existingItem) {
			existingItem.quantity += 1;
			selectedItems = [...selectedItems];
		} else {
			selectedItems = [...selectedItems, { ...item, quantity: 1 }];
		}
	}

	function removeFromEstimate(itemId: string) {
		selectedItems = selectedItems.filter((item) => item.id !== itemId);
	}

	function updateQuantity(itemId: string, quantity: number) {
		if (quantity <= 0) {
			removeFromEstimate(itemId);
			return;
		}

		const item = selectedItems.find((item) => item.id === itemId);
		if (item) {
			item.quantity = quantity;
			selectedItems = [...selectedItems];
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			searchItems();
		}
	}

	function openDebugModal(index: number) {
		if (usingFallbackData) {
			// For fallback data, show the transformed result
			debugData = searchResults[index];
		} else {
			// For API data, show the raw API response
			debugData = rawApiResults[index] || searchResults[index];
		}
		debugModalOpen = true;
	}

	function closeDebugModal() {
		debugModalOpen = false;
		debugData = null;
	}

	function copyToClipboard() {
		if (debugData) {
			navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
	<div class="container mx-auto max-w-6xl px-4">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-4xl font-bold text-gray-800">Cost Estimate Calculator</h1>
			<p class="text-gray-600">Search for items and services to build your cost estimate</p>
			{#if usingFallbackData}
				<div class="mt-2 inline-block rounded-lg bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
					Using sample data (API unavailable)
				</div>
			{/if}
		</div>

		<!-- Search Section -->
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
					on:click={searchItems}
					disabled={isLoading || !searchQuery.trim()}
					class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? 'Searching...' : 'Search'}
				</button>
				<button
					on:click={clearCache}
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

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Search Results -->
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
											on:click={() => openDebugModal(index)}
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
										on:click={() => addToEstimate(item)}
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

			<!-- Cost Estimate -->
			<div class="rounded-xl bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-xl font-semibold text-gray-800">Cost Estimate</h2>

				{#if selectedItems.length === 0}
					<div class="py-8 text-center text-gray-500">
						No items added yet. Search and add items to build your estimate.
					</div>
				{:else}
					<div class="mb-6 space-y-3">
						{#each selectedItems as item}
							<div class="rounded-lg border border-gray-200 p-4">
								<div class="mb-2 flex items-start justify-between">
									<h3 class="font-medium text-gray-800">{item.name}</h3>
									<button
										on:click={() => removeFromEstimate(item.id)}
										class="text-sm text-red-500 hover:text-red-700"
									>
										Remove
									</button>
								</div>
								<div class="flex items-center gap-4">
									<div class="flex items-center gap-2">
										<label class="text-sm text-gray-600">Qty:</label>
										<input
											type="number"
											min="1"
											bind:value={item.quantity}
											on:input={(e) =>
												updateQuantity(item.id, parseInt(e.currentTarget.value) || 0)}
											class="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
										/>
									</div>
									<div class="text-sm text-gray-600">
										${item.cost.toFixed(2)}
										{item.unit ? `/ ${item.unit}` : 'each'}
									</div>
									<div class="ml-auto font-semibold text-green-600">
										${(item.cost * item.quantity).toFixed(2)}
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Total -->
					<div class="border-t border-gray-200 pt-4">
						<div class="flex items-center justify-between">
							<span class="text-xl font-semibold text-gray-800">Total Cost:</span>
							<span class="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</span>
						</div>
					</div>

					<!-- Export/Print buttons -->
					<div class="mt-6 flex gap-3">
						<button
							on:click={() => window.print()}
							class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Print Estimate
						</button>
						<button
							on:click={() => {
								const data = {
									items: selectedItems,
									total: totalCost,
									date: new Date().toISOString(),
									usingFallbackData
								};
								const blob = new Blob([JSON.stringify(data, null, 2)], {
									type: 'application/json'
								});
								const url = URL.createObjectURL(blob);
								const a = document.createElement('a');
								a.href = url;
								a.download = 'cost-estimate.json';
								a.click();
								URL.revokeObjectURL(url);
							}}
							class="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
						>
							Export JSON
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Debug Modal -->
{#if debugModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
		<div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
			<div class="flex items-center justify-between border-b border-gray-200 p-4">
				<h3 class="text-lg font-semibold text-gray-800">
					Raw JSON Data {usingFallbackData ? '(Sample Data)' : '(API Response)'}
				</h3>
				<div class="flex gap-2">
					<button
						on:click={copyToClipboard}
						class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
						title="Copy to clipboard"
					>
						📋 Copy
					</button>
					<button
						on:click={closeDebugModal}
						class="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
					>
						✕ Close
					</button>
				</div>
			</div>
			<div class="overflow-auto p-4" style="max-height: calc(90vh - 80px);">
				<pre class="overflow-x-auto rounded border bg-gray-50 p-4 text-xs text-gray-800"><code
						>{JSON.stringify(debugData, null, 2)}</code
					></pre>
			</div>
		</div>
	</div>
{/if}

<style>
	@media print {
		.no-print {
			display: none !important;
		}
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
