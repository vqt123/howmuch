<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let isOpen = false;
	export let debugData: any = null;
	export let usingFallbackData = false;

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	function handleClose() {
		dispatch('close');
	}

	function copyToClipboard() {
		if (debugData) {
			navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
	>
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
						on:click={handleClose}
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
