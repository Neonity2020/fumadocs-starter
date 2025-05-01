import React from 'react';

const BlogPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold mb-4">Blog</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-2">Blog Post 1</h2>
                <p className="text-gray-600">This is the content of blog post 1.</p>
            </div>
        </div>
    </div>
  );
};

export default BlogPage;