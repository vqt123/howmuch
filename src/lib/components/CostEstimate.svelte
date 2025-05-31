<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SearchResult } from '$lib/sampleData';

	export let selectedItems: (SearchResult & { quantity: number })[] = [];
	export let totalCost = 0;
	export let usingFallbackData = false;

	const dispatch = createEventDispatcher<{
		removeItem: string;
		updateQuantity: { id: string; quantity: number };
	}>();

	function handleRemoveItem(itemId: string) {
		dispatch('removeItem', itemId);
	}

	function handleUpdateQuantity(itemId: string, quantity: number) {
		dispatch('updateQuantity', { id: itemId, quantity });
	}

	function handlePrint() {
		window.print();
	}

	function handleExportJSON() {
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
	}
</script>

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
							on:click={() => handleRemoveItem(item.id)}
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
									handleUpdateQuantity(item.id, parseInt(e.currentTarget.value) || 0)}
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
				on:click={handlePrint}
				class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
			>
				Print Estimate
			</button>
			<button
				on:click={handleExportJSON}
				class="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
			>
				Export JSON
			</button>
		</div>
	{/if}
</div>

<style>
	@media print {
		.no-print {
			display: none !important;
		}
	}
</style>
