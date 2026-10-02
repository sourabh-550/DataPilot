// Example questions built from the loaded database's real tables and columns,
// so every suggestion can be answered (no "customers from India" on a database
// without a country column).

const NUMERIC_TYPE = /int|real|num|dec|float|double|money/i;
const TEXT_TYPE = /char|text|clob|string/i;
const DATE_TYPE = /date|time/i;
const ID_NAME = /(^id$|_id$|^id_|[a-z]Id$)/i;
// Low-cardinality columns make the most readable groupings.
const GOOD_CATEGORY = /region|category|city|state|country|status|type|segment|department|channel|mode|method|gender|product/i;
const GOOD_MEASURE = /amount|revenue|sales|total|price|profit|cost|value/i;

const preferred = (cols, pattern) => [...cols.filter((c) => pattern.test(c.name)), ...cols.filter((c) => !pattern.test(c.name))];

const MAX_EXAMPLES = 5;

function describeTable(name, table) {
  const columns = table?.columns ?? [];
  const usable = columns.filter((c) => !ID_NAME.test(c.name));
  const dates = usable.filter((c) => DATE_TYPE.test(c.type) || /date/i.test(c.name));
  const measures = preferred(usable.filter((c) => NUMERIC_TYPE.test(c.type) && !dates.includes(c)), GOOD_MEASURE);
  const texts = usable.filter((c) => TEXT_TYPE.test(c.type) && !dates.includes(c));
  const categories = preferred(texts, GOOD_CATEGORY);
  return { name, columns, measures, categories, dates };
}

export function buildSqlExamples(schema) {
  const tables = Object.entries(schema ?? {}).map(([name, table]) => describeTable(name, table));
  if (tables.length === 0) {
    return ["What tables are in this database?", "How many rows does each table have?"];
  }

  const examples = [];
  const add = (q) => { if (!examples.includes(q)) examples.push(q); };

  // An aggregate: a measure grouped by a category, in the first table that has both.
  const fact = tables.find((t) => t.measures.length && t.categories.length);
  if (fact) {
    const measure = fact.measures[0].name;
    const category = fact.categories[0].name;
    // "Total total_amount" reads badly — measures already named total/sum get "Sum of".
    add(/^(total|sum)/i.test(measure) ? `Sum of ${measure} by ${category}` : `Total ${measure} by ${category}`);
    add(`Which ${category} has the highest average ${measure}?`);
  }

  // A join on a shared ID column (orders.customer_id ↔ customers.customer_id).
  outer: for (const a of tables) {
    for (const col of a.columns.filter((c) => ID_NAME.test(c.name) && c.name.toLowerCase() !== "id")) {
      const b = tables.find((t) => t !== a && t.columns.some((c) => c.name === col.name));
      if (b) {
        add(`Join ${a.name} and ${b.name} on ${col.name} and show 10 rows`);
        break outer;
      }
    }
  }

  // A trend over a date column.
  const dated = tables.find((t) => t.dates.length);
  if (dated) add(`Count ${dated.name} per month using ${dated.dates[0].name}`);

  // Generic ones that always work.
  add(`Show 10 rows from ${tables[0].name}`);
  for (const t of tables) add(`How many rows does ${t.name} have?`);

  return examples.slice(0, MAX_EXAMPLES);
}
