import knex from "../db/knex";

interface Entity {
  id: number;
  name: string;
}

interface EntityType {
  type: "city" | "brand" | "dishType" | "diet";
  table: string;
}

interface Combination {
  city?: Entity;
  brand?: Entity;
  dishType?: Entity;
  diet?: Entity;
}

const entityTypes: EntityType[] = [
  { type: "city", table: "cities" },
  { type: "brand", table: "brands" },
  { type: "dishType", table: "dish_types" },
  { type: "diet", table: "diets" },
];

const createLikeConditions = (words: string[]): string[] =>
  words.map((word) => `%${word}%`);

const createEntityQuery = (entityType: EntityType, likeConditions: string[]) =>
  knex
    .select(["id", "name", knex.raw(`'${entityType.type}' as type`)])
    .from(entityType.table)
    .whereRaw(
      `LOWER(name) LIKE ANY (ARRAY[${likeConditions
        .map(() => "?")
        .join(",")}])`,
      likeConditions
    );

const createUnionQuery = (
  entityTypes: EntityType[],
  likeConditions: string[]
) =>
  entityTypes.reduce(
    (query, entityType, index) =>
      index === 0
        ? createEntityQuery(entityType, likeConditions)
        : query.union(createEntityQuery(entityType, likeConditions)),
    knex.queryBuilder()
  );

const groupEntitiesByType = (results: any[]): { [key: string]: Entity[] } =>
  results.reduce((acc, result) => {
    const { type, ...entity } = result;
    acc[type] = [...(acc[type] || []), entity];
    return acc;
  }, {});

const fetchEntities = async (
  searchTerm: string
): Promise<{ [key: string]: Entity[] }> => {
  const words = searchTerm.toLowerCase().split(/\s+/);
  const likeConditions = createLikeConditions(words);
  const query = createUnionQuery(entityTypes, likeConditions);

  console.log(query.toString());

  const results = await query;
  return groupEntitiesByType(results);
};

const generateCombinations = (entities: {
  [key: string]: Entity[];
}): Combination[] => {
  const combinations: Combination[] = [];

  const addCombination = (combination: Combination) => {
    if (!combinations.find((c) => JSON.stringify(c) === JSON.stringify(combination))) {
      // Avoid duplicates
      combinations.push(combination);
    }
  };

  const generate = (current: Combination, remainingTypes: string[], usedWords: Set<string>) => {
    if (remainingTypes.length === 0) {
      // break condition for recursion and add the current combination
      addCombination(current);
      return;
    }

    const [type, ...remaining] = remainingTypes;
    if (entities[type]) {
      entities[type].forEach((entity) => {
        const entityWords = entity.name.toLowerCase().split(/\s+/);
        const intersection = entityWords.filter(word => usedWords.has(word));
        if (intersection.length === 0) {
          const newUsedWords = new Set([...usedWords, ...entityWords]);
          generate({ ...current, [type]: entity }, remaining, newUsedWords);
        }
      });
    } else {
      generate(current, remaining, usedWords);
    }
  };

  // basically a recursive function that generates all possible combinations
  // grouping by entity type
  generate({}, Object.keys(entities), new Set());
  return combinations;
};

const extractEntities = async (searchTerm: string): Promise<Combination[]> => {
  const entities = await fetchEntities(searchTerm);
  const combinations = generateCombinations(entities);

  return combinations.flatMap((combination) => {
    // If both dishType and brand are present, return two combinations with one of them removed
    // This is to avoid returning combinations with both dishType and brand, as they are not valid

    if (combination.dishType && combination.brand) {
      return [
        {...combination, brand: undefined},
        {...combination, dishType: undefined},
      ];
    }
    return [combination];
  });
};

export { extractEntities };