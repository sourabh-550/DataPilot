export default function ResultTable({ columns, rows }) {
  if (!columns || !rows || rows.length === 0) return null;

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-t border-gray-700 
                ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-850"} 
                hover:bg-gray-700 transition`}
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-gray-300 whitespace-nowrap">
                  {row[col] !== null && row[col] !== undefined
                    ? String(row[col])
                    : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-gray-800 text-gray-500 text-xs border-t border-gray-700">
        {rows.length} row{rows.length !== 1 ? "s" : ""} returned
      </div>
    </div>
  );
}