# Cost Estimate Calculator

A modern, responsive web application for searching and calculating cost estimates using external API endpoints.

## Features

- 🔍 **Smart Search**: Search for construction items, services, and materials
- 💰 **Cost Calculation**: Add items to your estimate and calculate totals
- 📊 **Quantity Management**: Adjust quantities for each item
- 🗑️ **Cache Management**: Clear API cache when needed
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Modern UI**: Beautiful interface built with TailwindCSS
- 📄 **Export Options**: Print estimates or export as JSON
- 🔄 **Fallback Data**: Sample data when API is unavailable

## API Endpoints Used

The application integrates with the following endpoints:

- **Search**: `GET http://localhost:3001/api/search?q=your+query`

  - Returns cost estimates for construction items and services
  - Response format: `{ "success": true, "data": { "query": "...", "results": [...] } }`

- **Clear Cache**: `POST http://localhost:3001/api/clear-cache`
  - Clears the API server cache
  - Response format: `{ "success": true, "message": "Cache cleared successfully" }`

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Usage

1. **Search for Items**: Enter keywords like "paint", "kitchen", "flooring", etc.
2. **Add to Estimate**: Click "Add to Estimate" on any search result
3. **Manage Quantities**: Adjust quantities using the number inputs
4. **View Total**: See your running total in the Cost Estimate panel
5. **Export/Print**: Use the export buttons to save or print your estimate
6. **Clear Cache**: Use the 🗑️ button to clear the API cache

## Fallback Mode

When the API server at `localhost:3001` is unavailable, the application automatically switches to sample data mode. This allows you to test the interface with predefined items including:

- Interior/Exterior Paint
- Drywall Installation
- Electrical Work
- Hardwood Flooring
- Kitchen Cabinets
- Window Installation
- And more...

## Technology Stack

- **Framework**: SvelteKit 2.0
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite

## Sample API Responses

### Search Response

```json
{
	"success": true,
	"data": {
		"query": "kitchen",
		"results": [
			{
				"id": "cost_of_modern_kitchen_remodel_9a7ac7_processed",
				"title": "Modern Kitchen Remodeling Costs - 2025",
				"description": "Get 2025 example estimates...",
				"category": "general",
				"cost": {
					"original": { "low": 31252, "high": 39070, "unit": "per project" }
				}
			}
		]
	}
}
```

### Clear Cache Response

```json
{
	"success": true,
	"message": "Cache cleared successfully"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
