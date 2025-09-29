import type {TableColumn} from "../types/entity.tsx";

interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    keyExtractor: (item: T) => string;
    className?: string;
}

const Table = <T,>({ data, columns, keyExtractor, className = '' }: TableProps<T>) => {
    return (
        <div className={`overflow-x-auto bg-white rounded-lg shadow ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    {columns.map((column) => (
                        <th
                            key={String(column.key)}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {column.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                    <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                        {columns.map((column) => (
                            <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {column.render
                                    ? column.render(item[column.key], item)
                                    : String(item[column.key])
                                }
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
            {data.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    暂无数据
                </div>
            )}
        </div>
    );
};

export default Table;