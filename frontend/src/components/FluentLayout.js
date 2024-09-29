import React from 'react';
import Masonry from 'react-masonry-css';

const FluentLayout = ({ layoutType, items, renderItem, breakpointColumnsObj }) => {
    if (layoutType === 'masonry') {
        return (
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
            >
                {items.map((item, index) => renderItem(item, index))}
            </Masonry>
        );
    } else if (layoutType === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item, index) => renderItem(item, index))}
            </div>
        );
    } else {
        return (
            <div className="flex flex-col space-y-4 max-w-[600px] mx-auto">
                {items.map((item, index) => renderItem(item, index))}
            </div>
        );
    }
};

export default FluentLayout;
