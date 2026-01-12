// client/src/components/common/CommonPagination.tsx
import React from 'react';
import {
    Pagination,
    Box,
    Typography
} from '@mui/material';
import './CommonPagination.scss';

interface CommonPaginationProps {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
}

const CommonPagination: React.FC<CommonPaginationProps> = ({
    totalCount,
    pageSize,
    currentPage,
    onPageChange
}) => {
    const pageCount = Math.ceil(totalCount / pageSize);

    return (
        <Box className="custom-pagination-container">
            {/* Result Information */}
            <Typography className="entries-info" variant="body2">
                Showing {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </Typography>

            <Box className="pagination-controls">
                {/* MUI Pagination Component */}
                <Pagination
                    count={pageCount}
                    page={currentPage}
                    onChange={onPageChange}
                    color="primary"
                    shape="rounded"
                    size="medium"
                    showFirstButton
                    showLastButton
                />
            </Box>
        </Box>
    );
};

export default CommonPagination;