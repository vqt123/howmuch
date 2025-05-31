<script lang="ts">
	import { searchSampleData, type SearchResult } from '$lib/sampleData';
	import Header from '$lib/components/Header.svelte';
	import SearchForm from '$lib/components/SearchForm.svelte';
	import SearchResults from '$lib/components/SearchResults.svelte';
	import CostEstimate from '$lib/components/CostEstimate.svelte';
	import DebugModal from '$lib/components/DebugModal.svelte';

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

	// Event handlers for components
	function handleSearch(event: CustomEvent<string>) {
		searchQuery = event.detail;
		searchItems();
	}

	function handleAddToEstimate(event: CustomEvent<SearchResult>) {
		addToEstimate(event.detail);
	}

	function handleRemoveItem(event: CustomEvent<string>) {
		removeFromEstimate(event.detail);
	}

	function handleUpdateQuantity(event: CustomEvent<{ id: string; quantity: number }>) {
		updateQuantity(event.detail.id, event.detail.quantity);
	}

	function handleOpenDebug(event: CustomEvent<number>) {
		openDebugModal(event.detail);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
	<div class="container mx-auto max-w-6xl px-4">
		<Header {usingFallbackData} />

		<SearchForm
			bind:searchQuery
			{isLoading}
			{error}
			{usingFallbackData}
			on:search={handleSearch}
			on:clearCache={clearCache}
		/>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<SearchResults
				{searchResults}
				{isLoading}
				{searchQuery}
				{usingFallbackData}
				on:addToEstimate={handleAddToEstimate}
				on:openDebug={handleOpenDebug}
			/>

			<CostEstimate
				{selectedItems}
				{totalCost}
				{usingFallbackData}
				on:removeItem={handleRemoveItem}
				on:updateQuantity={handleUpdateQuantity}
			/>
		</div>
	</div>
</div>

<DebugModal isOpen={debugModalOpen} {debugData} {usingFallbackData} on:close={closeDebugModal} />

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
