import fs from 'fs';

// Search terms to test
const searchTerms = [
  'paint',
  'kitchen',
  'bathroom',
  'flooring',
  'electrical',
  'plumbing',
  'roofing',
  'drywall',
  'installation',
  'concrete',
  'wood',
  'tile',
  'carpet',
  'window',
  'door',
  'cabinet',
  'countertop',
  'lighting',
  'insulation',
  'HVAC',
  'foundation',
  'siding',
  'deck',
  'fence',
  'landscaping',
  'driveway',
  'garage',
  'basement',
  'attic',
  'renovation'
];

async function makeAPICall(searchTerm) {
  try {
    const url = `http://localhost:3001/api/search?q=${encodeURIComponent(searchTerm)}`;
    console.log(`Making request for: ${searchTerm}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      searchTerm,
      timestamp: new Date().toISOString(),
      status: response.status,
      url,
      response: data
    };
  } catch (error) {
    return {
      searchTerm,
      timestamp: new Date().toISOString(),
      error: error.message,
      url: `http://localhost:3001/api/search?q=${encodeURIComponent(searchTerm)}`
    };
  }
}

async function analyzeAPIResponses() {
  console.log('Starting API analysis...');
  console.log(`Testing ${searchTerms.length} different search terms`);
  
  const results = [];
  
  // Make API calls with delays to avoid overwhelming the server
  for (let i = 0; i < searchTerms.length; i++) {
    const searchTerm = searchTerms[i];
    console.log(`[${i + 1}/${searchTerms.length}] Testing: ${searchTerm}`);
    
    const result = await makeAPICall(searchTerm);
    results.push(result);
    
    // Add a small delay between requests
    if (i < searchTerms.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Generate analysis report
  const analysis = {
    summary: {
      totalQueries: results.length,
      successfulQueries: results.filter(r => !r.error).length,
      failedQueries: results.filter(r => r.error).length,
      timestamp: new Date().toISOString()
    },
    results: results
  };
  
  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `api-analysis-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(analysis, null, 2));
  console.log(`\nResults saved to: ${filename}`);
  
  // Generate summary report
  const summaryReport = generateSummaryReport(results);
  const summaryFilename = `api-summary-${timestamp}.md`;
  fs.writeFileSync(summaryFilename, summaryReport);
  console.log(`Summary report saved to: ${summaryFilename}`);
  
  return analysis;
}

function generateSummaryReport(results) {
  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);
  
  let report = `# API Response Analysis Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n`;
  report += `- **Total Queries:** ${results.length}\n`;
  report += `- **Successful:** ${successful.length}\n`;
  report += `- **Failed:** ${failed.length}\n`;
  report += `- **Success Rate:** ${((successful.length / results.length) * 100).toFixed(1)}%\n\n`;
  
  if (failed.length > 0) {
    report += `## Failed Queries\n`;
    failed.forEach(result => {
      report += `- **${result.searchTerm}:** ${result.error}\n`;
    });
    report += `\n`;
  }
  
  if (successful.length > 0) {
    // Analyze response structure
    const sampleResponse = successful[0].response;
    report += `## Response Structure Analysis\n`;
    report += `\`\`\`json\n${JSON.stringify(sampleResponse, null, 2).substring(0, 500)}...\n\`\`\`\n\n`;
    
    // Analyze result counts
    report += `## Results Per Query\n`;
    successful.forEach(result => {
      const resultCount = result.response?.data?.results?.length || 0;
      report += `- **${result.searchTerm}:** ${resultCount} results\n`;
    });
    report += `\n`;
    
    // Analyze cost ranges
    report += `## Cost Analysis\n`;
    const allCosts = [];
    successful.forEach(result => {
      if (result.response?.data?.results) {
        result.response.data.results.forEach(item => {
          const cost = item.cost?.adjusted?.low || item.cost?.original?.low;
          if (cost && typeof cost === 'number') {
            allCosts.push({
              searchTerm: result.searchTerm,
              title: item.title,
              cost: cost,
              unit: item.cost?.adjusted?.unit || item.cost?.original?.unit
            });
          }
        });
      }
    });
    
    if (allCosts.length > 0) {
      const sortedCosts = allCosts.sort((a, b) => a.cost - b.cost);
      report += `- **Total Items with Costs:** ${allCosts.length}\n`;
      report += `- **Lowest Cost:** $${sortedCosts[0].cost.toLocaleString()} (${sortedCosts[0].title})\n`;
      report += `- **Highest Cost:** $${sortedCosts[sortedCosts.length - 1].cost.toLocaleString()} (${sortedCosts[sortedCosts.length - 1].title})\n`;
      report += `- **Average Cost:** $${(allCosts.reduce((sum, item) => sum + item.cost, 0) / allCosts.length).toFixed(2)}\n\n`;
    }
    
    // Analyze common categories
    const categories = {};
    successful.forEach(result => {
      if (result.response?.data?.results) {
        result.response.data.results.forEach(item => {
          const category = item.category || 'uncategorized';
          categories[category] = (categories[category] || 0) + 1;
        });
      }
    });
    
    report += `## Categories Found\n`;
    Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        report += `- **${category}:** ${count} items\n`;
      });
    report += `\n`;
  }
  
  report += `## Recommendations\n`;
  report += `Based on this analysis, consider:\n`;
  report += `1. Improving search result presentation for high-volume categories\n`;
  report += `2. Adding cost range filters\n`;
  report += `3. Implementing category-based navigation\n`;
  report += `4. Adding unit-based sorting and filtering\n`;
  report += `5. Implementing cost comparison features\n`;
  
  return report;
}

// Run the analysis
analyzeAPIResponses()
  .then(() => {
    console.log('\nAnalysis complete!');
  })
  .catch(error => {
    console.error('Analysis failed:', error);
  }); 