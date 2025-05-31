export interface SearchResult {
	id: string;
	name: string;
	description: string;
	cost: number;
	category: string;
	unit?: string;
}

export const sampleData: SearchResult[] = [
	{
		id: '1',
		name: 'Interior Paint',
		description: 'High-quality latex paint for interior walls',
		cost: 45.99,
		category: 'Materials',
		unit: 'gallon'
	},
	{
		id: '2',
		name: 'Exterior Paint',
		description: 'Weather-resistant exterior house paint',
		cost: 52.99,
		category: 'Materials',
		unit: 'gallon'
	},
	{
		id: '3',
		name: 'Paint Brushes Set',
		description: 'Professional painting brush set (4 pieces)',
		cost: 24.99,
		category: 'Tools',
		unit: 'set'
	},
	{
		id: '4',
		name: 'Drywall Installation',
		description: 'Professional drywall installation service',
		cost: 2.5,
		category: 'Labor',
		unit: 'sq ft'
	},
	{
		id: '5',
		name: 'Electrical Outlet Installation',
		description: 'Installation of standard electrical outlet',
		cost: 125.0,
		category: 'Electrical',
		unit: 'outlet'
	},
	{
		id: '6',
		name: 'Hardwood Flooring',
		description: 'Premium oak hardwood flooring',
		cost: 8.99,
		category: 'Flooring',
		unit: 'sq ft'
	},
	{
		id: '7',
		name: 'Plumbing Consultation',
		description: 'Professional plumbing assessment and consultation',
		cost: 95.0,
		category: 'Plumbing',
		unit: 'hour'
	},
	{
		id: '8',
		name: 'Carpet Installation',
		description: 'Professional carpet installation with padding',
		cost: 4.5,
		category: 'Flooring',
		unit: 'sq ft'
	},
	{
		id: '9',
		name: 'Kitchen Cabinet',
		description: 'Standard base kitchen cabinet',
		cost: 289.99,
		category: 'Cabinets',
		unit: 'cabinet'
	},
	{
		id: '10',
		name: 'Window Installation',
		description: 'Double-pane window installation',
		cost: 450.0,
		category: 'Windows',
		unit: 'window'
	}
];

export function searchSampleData(query: string): SearchResult[] {
	const lowerQuery = query.toLowerCase();
	return sampleData.filter(
		(item) =>
			item.name.toLowerCase().includes(lowerQuery) ||
			item.description.toLowerCase().includes(lowerQuery) ||
			item.category.toLowerCase().includes(lowerQuery)
	);
}
