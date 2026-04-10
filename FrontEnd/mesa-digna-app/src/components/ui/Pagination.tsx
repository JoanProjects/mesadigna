interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({page, totalPages, onPageChange,}: PaginationProps) {
    if (totalPages === 0) return null;

    return (
        <div className="flex items-center justify-between gap-4 py-2.5">
            <div className="flex-1 flex justify-start">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    Anterior
                </button>
            </div>

            <div className="shrink-0 text-sm text-text-secondary text-center">
                Página {page} de {totalPages}
            </div>

            <div className="flex-1 flex justify-end">
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}