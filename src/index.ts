import { extractEntities } from "./services/EntityExtractor";

async function main() {
  const searchTerms = [
    "McDonald's",
    "McDonald's in London",
    "vegan sushi in London",
    "veg london",
    "McDonald's in London or Manchester",
    "sushi in london",
  ];

  for (const searchTerm of searchTerms) {
    console.log(`\nSearch term: "${searchTerm}"`);
    const results = await extractEntities(searchTerm);
    console.log(JSON.stringify(results, null, 2));
  }
}

main().catch(console.error);
